import { defineMiddlewares } from "@medusajs/medusa"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { allowRequest } from "../modules/loyalty/referral"

const buckets = new Map<string, { count: number; resetAt: number }>()

function rateLimit(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const ip = req.ip || "unknown"
  const current = buckets.get(ip) || { count: 0, resetAt: 0 }
  const decision = allowRequest(current, Date.now(), 20)
  buckets.set(ip, decision.next)
  if (!decision.allowed) {
    res.status(429).json({ message: "Troppe richieste. Riprova tra un minuto." })
    return
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/loyalty/referral*",
      method: ["POST"],
      middlewares: [rateLimit],
    },
  ],
})
