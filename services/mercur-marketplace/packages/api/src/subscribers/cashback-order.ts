import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendTransactionalEmail } from "../lib/notifications/transactional"
import { LOYALTY_MODULE } from "../modules/loyalty"
import { buildRewardEntries, type BenefitMode, type QuoteLineOutput } from "../modules/loyalty/quote"
import { formatSnapshotText, type SnapshotLine } from "../modules/loyalty/snapshot-text"

type PaymentEvent = { id?: string; order_id?: string }

type OrderRef = {
  id: string
  cart_id?: string | null
  email?: string | null
  customer_id?: string | null
}

async function findOrder(
  container: SubscriberArgs<PaymentEvent>["container"],
  event: PaymentEvent
): Promise<OrderRef | null> {
  if (event.order_id) return { id: event.order_id }
  if (!event.id) return null
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const { data } = await query.graph({
      entity: "payment",
      fields: [
        "id",
        "payment_collection.order.id",
        "payment_collection.order.email",
        "payment_collection.order.customer_id",
        "payment_collection.cart.id",
      ],
      filters: { id: event.id },
    })
    const payment = (data || [])[0] as {
      payment_collection?: {
        order?: { id?: string; email?: string | null; customer_id?: string | null }
        cart?: { id?: string }
      }
    }
    const order = payment?.payment_collection?.order
    if (!order?.id) return null
    return {
      id: order.id,
      email: order.email,
      customer_id: order.customer_id,
      cart_id: payment.payment_collection?.cart?.id,
    }
  } catch {
    return null
  }
}

function asSnapshot(row: {
  line_id: string
  sku: string
  qty: string
  initial_price_cents: string
  vat_rate_bps: string
  discount_cents: string
  price_paid_cents: string
  reward_cents: string
  internal_cents: string
  code?: string | null
  campaign_version?: string | null
  mode: string
  referrer_customer_id?: string | null
}): QuoteLineOutput {
  return {
    line_id: row.line_id,
    sku: row.sku,
    qty: Number(row.qty),
    initial_price_cents: Number(row.initial_price_cents),
    vat_rate_bps: Number(row.vat_rate_bps),
    discount_cents: Number(row.discount_cents),
    price_paid_cents: Number(row.price_paid_cents),
    reward_cents: Number(row.reward_cents),
    internal_cents: Number(row.internal_cents),
    code: row.code || null,
    campaign_version: row.campaign_version ? Number(row.campaign_version) : null,
    tier_bps: null,
    reward_base_cents: 0,
  }
}

export default async function rewardOnPaymentCaptured({
  event,
  container,
}: SubscriberArgs<PaymentEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const loyalty = container.resolve(LOYALTY_MODULE)
  if (event.name === "order.canceled" || event.name === "payment.payment_failed") {
    const cartId = (event.data as { cart_id?: string }).cart_id
    const rows = await loyalty.listCodeReservations(cartId ? { cart_id: cartId, status: "reserved" } : { status: "reserved" })
    for (const row of rows) {
      if (cartId && row.cart_id !== cartId) continue
      await loyalty.updateCodeReservations({ id: row.id, status: "released" })
    }
    return
  }
  if (event.name !== "payment.captured") return
  const order = await findOrder(container, event.data)
  if (!order) {
    logger.warn("reward-on-capture: ordine non trovato, nessun accredito inventato")
    return
  }
  let snapshots = await loyalty.listBenefitSnapshots({ order_id: order.id })
  if (!snapshots.length && order.cart_id) {
    const pending = await loyalty.listBenefitSnapshots({ cart_id: order.cart_id })
    for (const row of pending) {
      await loyalty.updateBenefitSnapshots({ id: row.id, order_id: order.id })
    }
    snapshots = pending
  }
  if (!snapshots.length) return
  const mode = (snapshots[0].mode || "none") as BenefitMode
  const lines = snapshots.map(asSnapshot)
  const movements = buildRewardEntries({
    orderId: order.id,
    mode,
    referrerCustomerId: snapshots[0].referrer_customer_id,
    lines,
  })
  for (const movement of movements) {
    await loyalty.appendEntry({
      customer_id: movement.customer_id,
      order_id: movement.order_id,
      line_id: movement.line_id,
      entry_type: movement.entry_type,
      amount_cents: String(movement.amount_cents),
      idempotency_key: movement.idempotency_key,
      note: "Movimento per riga alla cattura del pagamento",
    })
  }
  const consumed = await loyalty.listCodeReservations({ status: "reserved" })
  for (const row of consumed) {
    if (order.cart_id && row.cart_id !== order.cart_id) continue
    await loyalty.updateCodeReservations({ id: row.id, status: "consumed" })
  }
  const textLines: SnapshotLine[] = lines.map((line) => ({
    sku: line.sku,
    qty: line.qty,
    initial_price_cents: line.initial_price_cents,
    vat_rate_bps: line.vat_rate_bps,
    discount_cents: line.discount_cents,
    price_paid_cents: line.price_paid_cents,
    reward_cents: line.reward_cents,
    internal_cents: line.internal_cents,
    code: line.code,
    campaign_version: line.campaign_version,
  }))
  if (order.email) {
    await sendTransactionalEmail({
      to: order.email,
      subject: "WheBack — dettaglio del vantaggio",
      text: formatSnapshotText(textLines),
    })
  }
}

export const config: SubscriberConfig = {
  event: ["payment.captured", "payment.payment_failed", "order.canceled"],
}
