import { model } from "@medusajs/framework/utils"

const BenefitSnapshot = model.define("benefit_snapshot", {
  id: model.id().primaryKey(),
  cart_id: model.text(),
  order_id: model.text().nullable(),
  line_id: model.text(),
  mode: model.text(),
  sku: model.text(),
  qty: model.text(),
  initial_price_cents: model.text(),
  vat_rate_bps: model.text(),
  discount_cents: model.text(),
  price_paid_cents: model.text(),
  reward_cents: model.text(),
  internal_cents: model.text(),
  code: model.text().nullable(),
  campaign_version: model.text().nullable(),
  referrer_customer_id: model.text().nullable(),
})

export default BenefitSnapshot
