import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cashbackRate, unlockDays } from "../../../../modules/loyalty/domain"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const rate = cashbackRate()
  res.json({
    source: "builtin",
    cashback_rate: rate,
    unlock_days: unlockDays(),
    headline: "fino al 105% in credito WheBack",
    badge: `fino al ${Math.round(rate * 100)}% in credito WheBack`,
  })
}
