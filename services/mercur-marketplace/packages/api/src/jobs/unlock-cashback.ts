import type { MedusaContainer } from "@medusajs/framework/types"
import { LOYALTY_MODULE } from "../modules/loyalty"
import { accrualsReadyToUnlock, type EntryType, type LedgerEntry } from "../modules/loyalty/domain"
import { benefitFlags } from "../modules/loyalty/flags"

export default async function unlockCashback(container: MedusaContainer) {
  const flags = benefitFlags()
  if (flags.rewardUnlockEvent !== "payment.captured" || flags.rewardUnlockDays == null) return
  const loyalty = container.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listCashbackEntries({})
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
  for (const accrual of accrualsReadyToUnlock(entries, new Date(), flags.rewardUnlockDays)) {
    await loyalty.appendEntry({
      customer_id: accrual.customer_id,
      order_id: accrual.order_id,
      entry_type: "unlock",
      amount_cents: String(accrual.amount_cents),
      source_entry_id: accrual.id,
      idempotency_key: `unlock:${accrual.id}`,
      note: "Sblocco dopo il periodo di attesa",
    })
  }
}

export const config = {
  name: "unlock-cashback",
  schedule: "0 3 * * *",
}
