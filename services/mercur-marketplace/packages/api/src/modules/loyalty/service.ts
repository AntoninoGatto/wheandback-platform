import { MedusaService } from "@medusajs/framework/utils"
import CashbackEntry from "./models/cashback-entry"
import LoyaltyPlan from "./models/loyalty-plan"
import ReferralLink from "./models/referral-link"
import RewardSnapshot from "./models/reward-snapshot"

type EntryInput = {
  customer_id: string
  order_id?: string | null
  entry_type: string
  amount_cents: string
  currency_code?: string
  source_entry_id?: string | null
  idempotency_key: string
  note?: string | null
  actor_id?: string | null
}

class LoyaltyModuleService extends MedusaService({
  CashbackEntry,
  LoyaltyPlan,
  ReferralLink,
  RewardSnapshot,
}) {
  async appendEntry(input: EntryInput) {
    const existing = await this.listCashbackEntries({ idempotency_key: input.idempotency_key })
    if (existing[0]) return existing[0]
    return this.createCashbackEntries({
      currency_code: "eur",
      ...input,
    })
  }
}

export default LoyaltyModuleService
