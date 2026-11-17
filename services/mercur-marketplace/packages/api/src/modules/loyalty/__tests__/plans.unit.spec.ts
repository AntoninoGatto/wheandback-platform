import {
  assertCanApprove,
  pickActivePlan,
  resolveRule,
  snapshotLine,
  type CommissionPlan,
} from "../plans"
import { isSelfReferral, referralRewardCents } from "../referral"

const plan: CommissionPlan = {
  id: "plan_1",
  status: "approved",
  created_by: "admin_a",
  starts_at: "2026-01-01T00:00:00.000Z",
  ends_at: null,
  referral_orders: 1,
  monthly_cap_cents: 10000,
  tiers: { A: 0.35, B: 0.27, C: 0.21 },
  rules: [
    { id: "d", scope: "default", scope_id: null, cashback_rate: 0.05, referral_rate: 0.35 },
    { id: "c", scope: "category", scope_id: "cat_1", cashback_rate: 0.06, referral_rate: 0.27 },
    { id: "p", scope: "product", scope_id: "prod_1", cashback_rate: 0.08, referral_rate: 0.21 },
  ],
}

describe("commission plans and referral", () => {
  it("prefers product over category over default and snapshots the rate", () => {
    expect(resolveRule(plan, { product_id: "prod_1", category_id: "cat_1" })?.id).toBe("p")
    expect(resolveRule(plan, { product_id: "other", category_id: "cat_1" })?.cashback_rate).toBe(0.06)
    const snap = snapshotLine(plan, { product_id: "prod_1" })
    expect(snap.cashback_rate).toBe(0.08)
    expect(snap.plan_id).toBe("plan_1")
  })

  it("blocks self-approval and inactive plans", () => {
    expect(() => assertCanApprove({ ...plan, status: "draft" }, "admin_a")).toThrow(/non può/)
    expect(() => assertCanApprove({ ...plan, status: "draft" }, "admin_b")).not.toThrow()
    expect(pickActivePlan([{ ...plan, status: "draft" }], new Date("2026-06-01"))).toBeNull()
  })

  it("pays the first referred order only and rejects self-referral", () => {
    expect(
      isSelfReferral({
        referrer_customer_id: "a",
        referred_customer_id: "a",
      })
    ).toBe(true)
    expect(
      referralRewardCents({
        productGrossInclVatCents: 12200,
        tier: "A",
        paidOrderIndex: 1,
        maxRewardedOrders: 1,
        selfReferral: false,
        alreadyRewardedCentsThisMonth: 0,
        monthlyCapCents: 100000,
      })
    ).toBe(3500)
    expect(
      referralRewardCents({
        productGrossInclVatCents: 12200,
        tier: "A",
        paidOrderIndex: 2,
        maxRewardedOrders: 1,
        selfReferral: false,
        alreadyRewardedCentsThisMonth: 0,
        monthlyCapCents: 100000,
      })
    ).toBe(0)
    expect(
      referralRewardCents({
        productGrossInclVatCents: 12200,
        tier: "B",
        paidOrderIndex: 1,
        maxRewardedOrders: 1,
        selfReferral: false,
        alreadyRewardedCentsThisMonth: 9900,
        monthlyCapCents: 10000,
      })
    ).toBe(100)
  })
})
