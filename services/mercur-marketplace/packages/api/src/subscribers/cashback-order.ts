import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LOYALTY_MODULE } from "../modules/loyalty"
import { accrualCents } from "../modules/loyalty/domain"

type OrderEvent = { id: string }

async function loadOrder(container: SubscriberArgs<OrderEvent>["container"], id: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "total", "shipping_total", "item_total"],
    filters: { id },
  })
  return (data || [])[0] as
    | { id: string; customer_id?: string | null; item_total?: number | null; total?: number | null }
    | undefined
}

function cents(value?: number | null): number {
  if (value == null) return 0
  return value > 1000 ? Math.round(value) : Math.round(value * 100)
}

export default async function cashbackOnOrder({
  event,
  container,
}: SubscriberArgs<OrderEvent>) {
  const order = await loadOrder(container, event.data.id)
  if (!order?.customer_id) return
  const loyalty = container.resolve(LOYALTY_MODULE)
  const productGross = cents(order.item_total ?? order.total)
  if (event.name === "order.placed") {
    const amount = accrualCents(productGross)
    if (amount <= 0) return
    await loyalty.appendEntry({
      customer_id: order.customer_id,
      order_id: order.id,
      entry_type: "accrual_pending",
      amount_cents: String(amount),
      idempotency_key: `accrual:${order.id}`,
      note: "Accredito in attesa sul netto prodotti",
    })
    return
  }
  const rows = await loyalty.listCashbackEntries({ order_id: order.id, entry_type: "accrual_pending" })
  const accrual = rows[0]
  if (!accrual) return
  await loyalty.appendEntry({
    customer_id: order.customer_id,
    order_id: order.id,
    entry_type: "cancel",
    amount_cents: String(accrual.amount_cents),
    source_entry_id: accrual.id,
    idempotency_key: `cancel:${order.id}:${event.name}`,
    note: "Annullato per rimborso o reso",
  })
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.canceled", "order.return_received"],
}
