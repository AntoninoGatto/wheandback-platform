import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { resolveVatRateBps } from "../../../../../lib/commerce/config"
import { moneyUnit, toCents } from "../../../../../lib/commerce/money"
import { LOYALTY_MODULE } from "../../../../../modules/loyalty"
import { isInReview, type EconomicsRow } from "../../../../../modules/loyalty/economics"
import { benefitFlags } from "../../../../../modules/loyalty/flags"
import {
  quoteCart,
  quoteFingerprint,
  type BenefitMode,
  type PersonalCode,
  type PromoCode,
  type QuoteLineInput,
} from "../../../../../modules/loyalty/quote"
import { reservationDecision, reservationExpiry } from "../../../../../modules/loyalty/reservations"
import { supplierDiscountBps } from "../../../../../modules/loyalty/tiers"

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

type CartItem = {
  id: string
  quantity?: number
  unit_price?: number
  variant_id?: string | null
  variant?: { sku?: string | null } | null
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.params.id
  const body = (req.body || {}) as {
    mode?: BenefitMode
    referrer_code?: string
    coupon_codes?: string[]
    line_choices?: { line_id: string; code: string }[]
    commit?: boolean
    buyer_email?: string
  }
  if (body.mode !== "referrer" && body.mode !== "none" && body.mode !== "coupons") {
    res.status(400).json({ message: "Scegli un percorso: referrer, none o coupons." })
    return
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  let cart: { id: string; customer_id?: string | null; email?: string | null; items?: CartItem[] } | undefined
  try {
    const { data } = await query.graph({
      entity: "cart",
      fields: ["id", "customer_id", "email", "items.id", "items.quantity", "items.unit_price", "items.variant_id", "items.variant.sku"],
      filters: { id: cartId },
    })
    cart = (data || [])[0] as typeof cart
  } catch {
    res.status(404).json({ message: "Carrello non trovato" })
    return
  }
  if (!cart) {
    res.status(404).json({ message: "Carrello non trovato" })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const flags = benefitFlags()
  const unit = moneyUnit()
  const now = new Date().toISOString()
  const personalRows = await loyalty.listReferralLinks({})
  const personal: PersonalCode[] = []
  const seen = new Set<string>()
  for (const link of personalRows) {
    const code = String(link.code || "").toUpperCase()
    if (!code || seen.has(code)) continue
    seen.add(code)
    personal.push({
      code,
      referrer_customer_id: link.referrer_customer_id,
      referrer_email: link.referred_email,
    })
  }
  const campaigns = await loyalty.listPromoCampaigns({})
  const reservations = await loyalty.listCodeReservations({ status: "reserved" })
  const snapshots = await loyalty.listBenefitSnapshots({})
  const promos: PromoCode[] = []
  for (const campaign of campaigns) {
    const lines = await loyalty.listPromoCampaignLines({ campaign_id: campaign.id })
    const consumed = new Set(
      snapshots.filter((row) => row.code === campaign.public_code && row.order_id).map((row) => row.order_id)
    ).size
    const reserved = reservations.filter(
      (row) => row.campaign_id === campaign.id && row.cart_id !== cartId && Date.parse(row.expires_at) > Date.parse(now)
    ).length
    for (const line of lines) {
      promos.push({
        code: campaign.public_code,
        variant_id: line.variant_id,
        discount_bps: num(line.discount_bps),
        campaign_id: campaign.id,
        campaign_version: num(campaign.version),
        starts_at: campaign.starts_at,
        ends_at: campaign.ends_at,
        status: campaign.status === "approved" || campaign.status === "expired" ? campaign.status : "draft",
        max_uses: campaign.max_uses == null || campaign.max_uses === "" ? null : num(campaign.max_uses),
        uses_consumed: consumed,
        uses_reserved: reserved,
      })
    }
  }
  const lines: QuoteLineInput[] = []
  for (const item of cart.items || []) {
    const qty = item.quantity || 1
    const economicsRows = item.variant_id ? await loyalty.listVariantEconomics({ variant_id: item.variant_id }) : []
    const row = economicsRows[0]
    const economics: EconomicsRow | null = row
      ? {
          variant_id: row.variant_id,
          sku: row.sku,
          supplier_id: row.supplier_id,
          price_list_source: row.price_list_source || "",
          price_list_date: row.price_list_date || "",
          supplier_cost_cents: num(row.supplier_cost_cents),
          reference_price_cents: num(row.reference_price_cents),
          reference_basis: row.reference_basis === "gross" ? "gross" : "net",
          vat_rate_bps: num(row.vat_rate_bps),
          public_price_cents: num(row.public_price_cents),
          reward_base_cents: num(row.reward_base_cents),
          min_margin_bps: num(row.min_margin_bps),
          compliance_status: row.compliance_status === "ok" ? "ok" : "missing",
          image_rights: row.image_rights || "",
        }
      : null
    const unitCents = toCents(item.unit_price, unit)
    const activeOverride = promos.find(
      (promo) => promo.variant_id === item.variant_id && promo.status === "approved"
    )
    lines.push({
      line_id: item.id,
      sku: economics?.sku || item.variant?.sku || item.variant_id || item.id,
      variant_id: item.variant_id || "",
      qty,
      initial_price_cents: economics ? economics.public_price_cents * qty : unitCents * qty,
      vat_rate_bps: economics?.vat_rate_bps ?? resolveVatRateBps(null, "it") ?? 0,
      reward_base_cents: economics?.reward_base_cents ?? 0,
      supplier_discount_bps: economics
        ? supplierDiscountBps(economics.reference_price_cents, economics.supplier_cost_cents)
        : null,
      referral_bps_override: activeOverride
        ? num(
            (await loyalty.listPromoCampaignLines({ campaign_id: activeOverride.campaign_id, variant_id: item.variant_id })).find(
              (line: { referral_bps_override?: string | null }) => line.referral_bps_override
            )?.referral_bps_override
          ) || null
        : null,
      in_review: economics ? isInReview(economics) : false,
    })
  }
  const quote = quoteCart({
    mode: body.mode,
    lines,
    now,
    referrer_code: body.referrer_code,
    buyer_customer_id: cart.customer_id || null,
    buyer_email: body.buyer_email || cart.email || null,
    coupon_codes: body.coupon_codes,
    line_choices: body.line_choices,
    promos,
    personal_codes: personal,
    referral_enabled: flags.referralEnabled,
    promo_enabled: flags.promoEnabled,
    referral_cap_cents: flags.referralCapCents,
  })
  if (body.commit && quote.confirmations.length === 0) {
    const referrer = personal.find((item) => item.code === String(body.referrer_code || "").trim().toUpperCase())
    for (const line of quote.lines) {
      const existing = await loyalty.listBenefitSnapshots({ cart_id: cartId, line_id: line.line_id })
      const payload = {
        cart_id: cartId,
        line_id: line.line_id,
        mode: body.mode,
        sku: line.sku,
        qty: String(line.qty),
        initial_price_cents: String(line.initial_price_cents),
        vat_rate_bps: String(line.vat_rate_bps),
        discount_cents: String(line.discount_cents),
        price_paid_cents: String(line.price_paid_cents),
        reward_cents: String(line.reward_cents),
        internal_cents: String(line.internal_cents),
        code: line.code,
        campaign_version: line.campaign_version == null ? null : String(line.campaign_version),
        referrer_customer_id: body.mode === "referrer" ? referrer?.referrer_customer_id || null : null,
      }
      if (existing[0]) await loyalty.updateBenefitSnapshots({ id: existing[0].id, ...payload })
      else await loyalty.createBenefitSnapshots(payload)
      if (line.code && line.campaign_version != null) {
        const promo = promos.find((item) => item.code.toUpperCase() === line.code && item.variant_id === lines.find((source) => source.line_id === line.line_id)?.variant_id)
        if (promo) {
          const decision = reservationDecision({
            maxUses: promo.max_uses,
            consumed: promo.uses_consumed,
            reservedByOthers: promo.uses_reserved,
          })
          if (decision === "reserve-last") {
            const key = `reserve:${cartId}:${promo.campaign_id}`
            const already = await loyalty.listCodeReservations({ idempotency_key: key })
            if (!already[0]) {
              await loyalty.createCodeReservations({
                campaign_id: promo.campaign_id,
                code: promo.code,
                cart_id: cartId,
                status: "reserved",
                expires_at: reservationExpiry(new Date()),
                idempotency_key: key,
              })
            }
          }
        }
      }
    }
  }
  res.json({ quote, fingerprint: quoteFingerprint(quote) })
}
