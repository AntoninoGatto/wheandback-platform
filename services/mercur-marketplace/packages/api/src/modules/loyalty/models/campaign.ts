import { model } from "@medusajs/framework/utils"

const Campaign = model.define("campaign", {
  id: model.id().primaryKey(),
  public_code: model.text(),
  version: model.text(),
  status: model.text(),
  starts_at: model.text(),
  ends_at: model.text(),
  timezone: model.text().default("Europe/Rome"),
  budget_cents: model.text().nullable(),
  max_uses: model.text().nullable(),
  created_by: model.text(),
  approved_by: model.text().nullable(),
  activated_at: model.text().nullable(),
})

export default Campaign
