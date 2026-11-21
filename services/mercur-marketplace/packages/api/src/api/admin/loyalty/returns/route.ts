import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { PROMO_INTERNAL_ID } from "../../../../modules/loyalty/domain"
import { allocateReturns } from "../../../../modules/loyalty/returns"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    order_id?: string
    line_id?: string
    price_parts?: number[]
  }
  if (!body.order_id || !body.line_id || !body.price_parts?.length) {
    res.status(400).json({ message: "order_id, line_id e price_parts sono obbligatori." })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const snapshots = await loyalty.listBenefitSnapshots({ order_id: body.order_id, line_id: body.line_id })
  const snapshot = snapshots[0]
  if (!snapshot) {
    res.status(404).json({ message: "Snapshot della riga non trovato" })
    return
  }
  let parts
  try {
    parts = allocateReturns({
      pricePaidCents: Number(snapshot.price_paid_cents),
      rewardCents: Number(snapshot.reward_cents),
      internalCents: Number(snapshot.internal_cents),
      priceParts: body.price_parts,
    })
  } catch (error) {
    res.status(422).json({ message: error instanceof Error ? error.message : "Reso non valido" })
    return
  }
  const accruals = await loyalty.listCashbackEntries({
    order_id: body.order_id,
    line_id: body.line_id,
    idempotency_key: `reward:${body.order_id}:${body.line_id}`,
  })
  const accrual = accruals[0]
  const beneficiary =
    snapshot.mode === "none" ? PROMO_INTERNAL_ID : snapshot.referrer_customer_id || accrual?.customer_id
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index]
    if (!beneficiary || (part.reward_cents === 0 && part.internal_cents === 0)) continue
    const amount = snapshot.mode === "none" ? part.internal_cents : part.reward_cents
    if (!amount) continue
    await loyalty.appendEntry({
      customer_id: beneficiary,
      order_id: body.order_id,
      line_id: body.line_id,
      entry_type: snapshot.mode === "none" ? "adjustment" : "reversal",
      amount_cents: String(amount),
      source_entry_id: accrual?.id || null,
      idempotency_key: `return:${body.order_id}:${body.line_id}:${index}`,
      note: "Storno parziale verso la destinazione originaria",
    })
  }
  res.json({ parts, refunded_price_cents: parts.reduce((sum, part) => sum + part.price_cents, 0) })
}
