import { MedusaService } from "@medusajs/framework/utils"
import BenefitSnapshot from "./models/benefit-snapshot"
import PromoCampaign from "./models/campaign"
import PromoCampaignLine from "./models/campaign-line"
import CashbackEntry from "./models/cashback-entry"
import CodeReservation from "./models/code-reservation"
import LoyaltyPlan from "./models/loyalty-plan"
import ReferralLink from "./models/referral-link"
import RewardSnapshot from "./models/reward-snapshot"
import SupportCase from "./models/support-case"
import VariantEconomic from "./models/variant-economic"

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
  line_id?: string | null
}

class LoyaltyModuleService extends MedusaService({
  CashbackEntry,
  LoyaltyPlan,
  ReferralLink,
  RewardSnapshot,
  VariantEconomic,
  PromoCampaign,
  PromoCampaignLine,
  CodeReservation,
  BenefitSnapshot,
  SupportCase,
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
