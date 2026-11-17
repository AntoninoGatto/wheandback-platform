import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import { isSelfReferral, normalizeEmail } from "../../../../modules/loyalty/referral"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    code?: string
    referred_customer_id?: string
    referred_email?: string
    payment_fingerprint?: string
    address_fingerprint?: string
  }
  if (!body.code) {
    res.status(400).json({ message: "Codice invito mancante" })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const links = await loyalty.listReferralLinks({ code: body.code })
  const link = links[0]
  if (!link) {
    res.status(404).json({ message: "Codice non trovato" })
    return
  }
  if (
    isSelfReferral({
      referrer_customer_id: link.referrer_customer_id,
      referred_customer_id: body.referred_customer_id,
      referred_email: body.referred_email,
      referrer_email: link.referred_email,
      referred_payment_fingerprint: body.payment_fingerprint,
      referrer_payment_fingerprint: link.payment_fingerprint,
      referred_address_fingerprint: body.address_fingerprint,
      referrer_address_fingerprint: link.address_fingerprint,
    })
  ) {
    res.status(422).json({ message: "Auto-invito non consentito" })
    return
  }
  const saved = await loyalty.createReferralLinks({
    referrer_customer_id: link.referrer_customer_id,
    code: body.code,
    referred_customer_id: body.referred_customer_id || null,
    referred_email: normalizeEmail(body.referred_email) || null,
    payment_fingerprint: body.payment_fingerprint || null,
    address_fingerprint: body.address_fingerprint || null,
  })
  res.status(201).json({ attribution: saved })
}
