import { model } from "@medusajs/framework/utils"

const SupportCase = model.define("support_case", {
  id: model.id().primaryKey(),
  case_number: model.text(),
  email: model.text(),
  order_id: model.text().nullable(),
  case_type: model.text(),
  status: model.text(),
  message: model.text(),
})

export default SupportCase
