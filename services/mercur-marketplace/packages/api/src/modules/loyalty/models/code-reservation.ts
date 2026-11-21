import { model } from "@medusajs/framework/utils"

const CodeReservation = model.define("code_reservation", {
  id: model.id().primaryKey(),
  campaign_id: model.text(),
  code: model.text(),
  cart_id: model.text(),
  status: model.text(),
  expires_at: model.text(),
  idempotency_key: model.text(),
})

export default CodeReservation
