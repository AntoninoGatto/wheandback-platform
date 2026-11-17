import { model } from "@medusajs/framework/utils"

const ReferralLink = model.define("referral_link", {
  id: model.id().primaryKey(),
  referrer_customer_id: model.text(),
  code: model.text(),
  referred_customer_id: model.text().nullable(),
  referred_email: model.text().nullable(),
  payment_fingerprint: model.text().nullable(),
  address_fingerprint: model.text().nullable(),
})

export default ReferralLink
