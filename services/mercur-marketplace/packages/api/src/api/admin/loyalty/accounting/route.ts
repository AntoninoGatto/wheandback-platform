import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { toAccountingCsv, type AccountingMovement } from "../../../../modules/loyalty/accounting"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const month = typeof req.query.month === "string" ? req.query.month : ""
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const entries = await loyalty.listCashbackEntries({})
  const snapshots = await loyalty.listBenefitSnapshots({})
  const rows: AccountingMovement[] = []
  for (const snapshot of snapshots) {
    const date = new Date(snapshot.created_at).toISOString().slice(0, 10)
    if (month && !date.startsWith(month)) continue
    rows.push({
      date,
      order_id: snapshot.order_id || snapshot.cart_id,
      kind: "order",
      sku: snapshot.sku,
      amount_cents: Number(snapshot.price_paid_cents),
      currency: "eur",
      beneficiary: snapshot.referrer_customer_id || "",
      note: snapshot.mode,
    })
    if (Number(snapshot.reward_cents) || Number(snapshot.internal_cents)) {
      rows.push({
        date,
        order_id: snapshot.order_id || snapshot.cart_id,
        kind: "reward",
        sku: snapshot.sku,
        amount_cents: Number(snapshot.reward_cents) || Number(snapshot.internal_cents),
        currency: "eur",
        beneficiary: snapshot.mode === "none" ? "promo_internal" : snapshot.referrer_customer_id || "",
        note: snapshot.code || snapshot.mode,
      })
    }
  }
  for (const entry of entries) {
    if (entry.entry_type !== "adjust" && entry.entry_type !== "adjustment") continue
    const date = new Date(entry.created_at).toISOString().slice(0, 10)
    if (month && !date.startsWith(month)) continue
    rows.push({
      date,
      order_id: entry.order_id || "",
      kind: "adjustment",
      sku: entry.line_id || "",
      amount_cents: Number(entry.amount_cents),
      currency: "eur",
      beneficiary: entry.customer_id,
      note: entry.note || "",
    })
  }
  res.setHeader("content-type", "text/csv; charset=utf-8")
  res.send(toAccountingCsv(rows))
}
