import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const customerId = typeof req.query.customer_id === "string" ? req.query.customer_id : undefined
  const entries = await loyalty.listCashbackEntries(customerId ? { customer_id: customerId } : {})
  res.json({ entries })
}
