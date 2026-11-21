import { model } from "@medusajs/framework/utils"

const CashbackEntry = model.define("cashback_entry", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  order_id: model.text().nullable(),
  entry_type: model.text(),
  amount_cents: model.text(),
  currency_code: model.text().default("eur"),
  source_entry_id: model.text().nullable(),
  idempotency_key: model.text(),
  note: model.text().nullable(),
  actor_id: model.text().nullable(),
  line_id: model.text().nullable(),
})

export default CashbackEntry
