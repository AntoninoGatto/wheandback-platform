import { model } from "@medusajs/framework/utils"

const RewardSnapshot = model.define("reward_snapshot", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  product_id: model.text(),
  plan_id: model.text(),
  cashback_rate: model.text(),
  referral_rate: model.text(),
  rule_scope: model.text(),
})

export default RewardSnapshot
