import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { benefitFlags } from "../../../../modules/loyalty/flags"
import { readPlanCache, writePlanCache } from "../../../../modules/loyalty/plan-cache"
import { pickActivePlan, type CommissionPlan, type PlanStatus } from "../../../../modules/loyalty/plans"

function noBenefit() {
  const flags = benefitFlags()
  return {
    source: "none",
    plan_id: null,
    cashback_rate: 0,
    unlock_days: flags.rewardUnlockDays,
    referral_tiers: null,
    benefit: null,
    headline: "",
    badge: "",
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cached = readPlanCache()
  if (cached) {
    res.json(cached.body)
    return
  }
  try {
    const loyalty = req.scope.resolve(LOYALTY_MODULE)
    const rows = await loyalty.listLoyaltyPlans({})
    const plans: CommissionPlan[] = rows.map((row) => ({
      id: row.id,
      status: (row.status === "approved" ? "approved" : "draft") as PlanStatus,
      created_by: row.created_by,
      approved_by: row.approved_by,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      referral_orders: Number(row.referral_orders),
      monthly_cap_cents: Number(row.monthly_cap_cents),
      tiers: JSON.parse(row.tiers_json),
      rules: JSON.parse(row.rules_json),
    }))
    const active = pickActivePlan(plans, new Date())
    const body = active
      ? {
          source: "plan",
          plan_id: active.id,
          cashback_rate: 0,
          unlock_days: benefitFlags().rewardUnlockDays,
          referral_tiers: active.tiers,
          benefit: null,
          headline: "",
          badge: "",
          starts_at: active.starts_at,
          ends_at: active.ends_at,
        }
      : noBenefit()
    writePlanCache(body)
    res.json(body)
  } catch {
    res.json(noBenefit())
  }
}
