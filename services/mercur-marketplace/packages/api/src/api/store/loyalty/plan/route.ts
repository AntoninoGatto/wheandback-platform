import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { cashbackRate, unlockDays } from "../../../../modules/loyalty/domain"
import { pickActivePlan, type CommissionPlan, type PlanStatus } from "../../../../modules/loyalty/plans"
import { readPlanCache, writePlanCache } from "../../../../modules/loyalty/plan-cache"

function builtin() {
  const rate = cashbackRate()
  return {
    source: "builtin",
    plan_id: "builtin",
    cashback_rate: rate,
    unlock_days: unlockDays(),
    referral_tiers: { A: 0.35, B: 0.27, C: 0.21 },
    referral_orders: 1,
    headline: "fino al 105% in credito WheBack",
    badge: `fino al ${Math.round(rate * 100)}% in credito WheBack`,
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
          cashback_rate: active.rules.find((rule) => rule.scope === "default")?.cashback_rate ?? cashbackRate(),
          unlock_days: unlockDays(),
          referral_tiers: active.tiers,
          referral_orders: active.referral_orders,
          headline: "fino al 105% in credito WheBack",
          badge: `fino al ${Math.round((active.rules.find((rule) => rule.scope === "default")?.cashback_rate ?? cashbackRate()) * 100)}% in credito WheBack`,
          starts_at: active.starts_at,
          ends_at: active.ends_at,
        }
      : builtin()
    writePlanCache(body)
    res.json(body)
  } catch {
    res.json(builtin())
  }
}
