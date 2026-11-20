import { model } from "@medusajs/framework/utils"

const CampaignLine = model.define("campaign_line", {
  id: model.id().primaryKey(),
  campaign_id: model.text(),
  variant_id: model.text(),
  discount_bps: model.text(),
  referral_bps_override: model.text().nullable(),
})

export default CampaignLine
