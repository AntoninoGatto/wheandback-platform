import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../modules/loyalty"
import { benefitFlags } from "../../../modules/loyalty/flags"
import { isInReview, minPreviousPrice, type EconomicsRow } from "../../../modules/loyalty/economics"
import { discountCents } from "../../../modules/loyalty/tiers"

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const flags = benefitFlags()
  if (!flags.promoEnabled) {
    res.json({ codes: [] })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const now = new Date().toISOString()
  const campaigns = await loyalty.listCampaigns({ status: "approved" })
  const codes: {
    code: string
    variant_id: string
    sku: string
    discount_bps: number
    public_price_cents: number
    discount_cents: number
    price_cents: number
    starts_at: string
    ends_at: string
    timezone: string
    max_uses: number | null
    campaign_version: number
    min_previous_price_cents: number | null
  }[] = []
  for (const campaign of campaigns) {
    if (Date.parse(campaign.starts_at) > Date.parse(now) || Date.parse(now) >= Date.parse(campaign.ends_at)) continue
    const lines = await loyalty.listCampaignLines({ campaign_id: campaign.id })
    for (const line of lines) {
      const economics = await loyalty.listVariantEconomics({ variant_id: line.variant_id })
      const row = economics[0]
      if (!row) continue
      const mapped: EconomicsRow = {
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
      if (isInReview(mapped)) continue
      const discount = discountCents(mapped.public_price_cents, num(line.discount_bps))
      codes.push({
        code: campaign.public_code,
        variant_id: mapped.variant_id,
        sku: mapped.sku,
        discount_bps: num(line.discount_bps),
        public_price_cents: mapped.public_price_cents,
        discount_cents: discount,
        price_cents: mapped.public_price_cents - discount,
        starts_at: campaign.starts_at,
        ends_at: campaign.ends_at,
        timezone: campaign.timezone || "Europe/Rome",
        max_uses: campaign.max_uses ? num(campaign.max_uses) : null,
        campaign_version: num(campaign.version),
        min_previous_price_cents: minPreviousPrice([], now),
      })
    }
  }
  res.json({ codes })
}
