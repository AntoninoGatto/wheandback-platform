import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { PROMO_INTERNAL_ID } from "../../../../modules/loyalty/domain"
import { internalBalance, type InternalEntryType } from "../../../../modules/loyalty/accounting"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listCashbackEntries({ customer_id: PROMO_INTERNAL_ID })
  const entries = rows.map((row) => ({
    type: (row.entry_type === "accrued" || row.entry_type === "adjustment" || row.entry_type === "committed" || row.entry_type === "spent"
      ? row.entry_type
      : "adjustment") as InternalEntryType,
    amount_cents: Number(row.amount_cents),
  }))
  res.json({ balance: internalBalance(entries), entries: rows })
}
