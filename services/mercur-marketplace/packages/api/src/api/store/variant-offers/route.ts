import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../modules/loyalty"
import { toPublicOffer, type EconomicsRow, type PublicCode } from "../../../modules/loyalty/economics"
import { benefitFlags } from "../../../modules/loyalty/flags"

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const variantId = typeof req.query.variant_id === "string" ? req.query.variant_id : ""
  if (!variantId) {
    res.status(400).json({ message: "variant_id obbligatorio" })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listVariantEconomics({ variant_id: variantId })
  const row = rows[0]
  if (!row) {
    res.status(404).json({ message: "Variante senza scheda economica" })
    return
  }
  const economics: EconomicsRow = {
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
  const flags = benefitFlags()
  const now = new Date().toISOString()
  const campaigns = flags.promoEnabled ? await loyalty.listCampaigns({ status: "approved" }) : []
  const codes: PublicCode[] = []
  for (const campaign of campaigns) {
    if (Date.parse(campaign.starts_at) > Date.parse(now) || Date.parse(now) >= Date.parse(campaign.ends_at)) continue
    const lines = await loyalty.listCampaignLines({ campaign_id: campaign.id, variant_id: variantId })
    for (const line of lines) {
      codes.push({
        code: campaign.public_code,
        discount_bps: num(line.discount_bps),
        ends_at: campaign.ends_at,
        timezone: campaign.timezone || "Europe/Rome",
        max_uses: campaign.max_uses ? num(campaign.max_uses) : null,
        campaign_version: num(campaign.version),
      })
    }
  }
  const offer = toPublicOffer(economics, codes, {
    referralEnabled: flags.referralEnabled,
    promoEnabled: flags.promoEnabled,
    now,
  })
  res.json({ offer })
}
