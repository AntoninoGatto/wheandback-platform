import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../modules/loyalty"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = typeof req.query.cart_id === "string" ? req.query.cart_id : ""
  const orderId = typeof req.query.order_id === "string" ? req.query.order_id : ""
  if (!cartId && !orderId) {
    res.status(400).json({ message: "Serve cart_id oppure order_id" })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listBenefitSnapshots(orderId ? { order_id: orderId } : { cart_id: cartId })
  res.json({
    lines: rows.map((row) => ({
      line_id: row.line_id,
      sku: row.sku,
      qty: Number(row.qty),
      initial_price_cents: Number(row.initial_price_cents),
      vat_rate_bps: Number(row.vat_rate_bps),
      discount_cents: Number(row.discount_cents),
      price_paid_cents: Number(row.price_paid_cents),
      reward_cents: Number(row.reward_cents),
      internal_cents: Number(row.internal_cents),
      code: row.code,
      campaign_version: row.campaign_version ? Number(row.campaign_version) : null,
      mode: row.mode,
    })),
  })
}
