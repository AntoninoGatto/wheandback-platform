import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { actorId, summarize, type EntryType, type LedgerEntry } from "../../../../modules/loyalty/domain"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = actorId(req as { auth_context?: { actor_id?: string } })
  if (!customerId) {
    res.status(401).json({ message: "Accedi per vedere il credito WheBack." })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listCashbackEntries({ customer_id: customerId })
  const entries: LedgerEntry[] = rows.map((row) => ({
    id: row.id,
    customer_id: row.customer_id,
    order_id: row.order_id,
    type: row.entry_type as EntryType,
    amount_cents: Number(row.amount_cents),
    source_entry_id: row.source_entry_id,
    idempotency_key: row.idempotency_key,
    created_at: new Date(row.created_at).toISOString(),
  }))
  res.json({ balances: summarize(entries), entries })
}
