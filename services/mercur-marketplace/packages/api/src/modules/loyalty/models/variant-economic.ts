import { model } from "@medusajs/framework/utils"

const VariantEconomic = model.define("variant_economics", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  sku: model.text(),
  supplier_id: model.text(),
  price_list_source: model.text().nullable(),
  price_list_date: model.text().nullable(),
  supplier_cost_cents: model.text(),
  reference_price_cents: model.text(),
  reference_basis: model.text(),
  vat_rate_bps: model.text(),
  public_price_cents: model.text(),
  reward_base_cents: model.text(),
  min_margin_bps: model.text(),
  compliance_status: model.text(),
  image_rights: model.text().nullable(),
  review_note: model.text().nullable(),
})

export default VariantEconomic
