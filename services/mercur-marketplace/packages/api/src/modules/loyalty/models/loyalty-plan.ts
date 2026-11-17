import { model } from "@medusajs/framework/utils"

const LoyaltyPlan = model.define("loyalty_plan", {
  id: model.id().primaryKey(),
  status: model.text(),
  created_by: model.text(),
  approved_by: model.text().nullable(),
  starts_at: model.text(),
  ends_at: model.text().nullable(),
  referral_orders: model.text(),
  monthly_cap_cents: model.text(),
  tiers_json: model.text(),
  rules_json: model.text(),
})

export default LoyaltyPlan
