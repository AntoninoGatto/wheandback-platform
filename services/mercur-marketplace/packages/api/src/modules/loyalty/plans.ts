export type PlanStatus = "draft" | "approved"
export type RuleScope = "product" | "vendor" | "category" | "default"

export type CommissionRule = {
  id: string
  scope: RuleScope
  scope_id: string | null
  cashback_rate: number
  referral_rate: number
}

export type CommissionPlan = {
  id: string
  status: PlanStatus
  created_by: string
  approved_by?: string | null
  starts_at: string
  ends_at?: string | null
  referral_orders: number
  monthly_cap_cents: number
  tiers: { A: number; B: number; C: number }
  rules: CommissionRule[]
}

const SCOPE_RANK: Record<RuleScope, number> = {
  product: 4,
  vendor: 3,
  category: 2,
  default: 1,
}

export function assertCanApprove(plan: CommissionPlan, actorId: string): void {
  if (plan.status === "approved") throw new Error("Piano già approvato")
  if (!actorId || actorId === plan.created_by) {
    throw new Error("Chi crea il piano non può approvarlo")
  }
}

export function isPlanActive(plan: CommissionPlan, now: Date): boolean {
  if (plan.status !== "approved") return false
  if (Date.parse(plan.starts_at) > now.getTime()) return false
  if (plan.ends_at && Date.parse(plan.ends_at) < now.getTime()) return false
  return true
}

export function pickActivePlan(plans: CommissionPlan[], now: Date): CommissionPlan | null {
  return (
    plans
      .filter((plan) => isPlanActive(plan, now))
      .sort((a, b) => Date.parse(b.starts_at) - Date.parse(a.starts_at))[0] || null
  )
}

export function resolveRule(
  plan: CommissionPlan,
  input: { product_id?: string; vendor_id?: string; category_id?: string }
): CommissionRule | null {
  const matches = plan.rules.filter((rule) => {
    if (rule.scope === "product") return rule.scope_id === input.product_id
    if (rule.scope === "vendor") return rule.scope_id === input.vendor_id
    if (rule.scope === "category") return rule.scope_id === input.category_id
    return rule.scope === "default"
  })
  matches.sort((a, b) => SCOPE_RANK[b.scope] - SCOPE_RANK[a.scope])
  return matches[0] || null
}

export type LineSnapshot = {
  product_id: string
  cashback_rate: number
  referral_rate: number
  rule_scope: RuleScope | "none"
  plan_id: string
}

export function snapshotLine(
  plan: CommissionPlan | null,
  input: { product_id: string; vendor_id?: string; category_id?: string },
  fallbackCashback = 0.05
): LineSnapshot {
  const rule = plan ? resolveRule(plan, input) : null
  return {
    product_id: input.product_id,
    cashback_rate: rule?.cashback_rate ?? fallbackCashback,
    referral_rate: rule?.referral_rate ?? plan?.tiers.A ?? 0.35,
    rule_scope: rule?.scope ?? "none",
    plan_id: plan?.id ?? "builtin",
  }
}
