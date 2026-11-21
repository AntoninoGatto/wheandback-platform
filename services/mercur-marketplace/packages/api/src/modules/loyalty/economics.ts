import { discountCents, lineRewardCents, supplierDiscountBps, tierFor } from "./tiers"

export type EconomicsRow = {
  variant_id: string
  sku: string
  supplier_id: string
  price_list_source: string
  price_list_date: string
  supplier_cost_cents: number
  reference_price_cents: number
  reference_basis: "net" | "gross"
  vat_rate_bps: number
  public_price_cents: number
  reward_base_cents: number
  min_margin_bps: number
  compliance_status: "ok" | "missing"
  image_rights: string
}

export type PublicCode = {
  code: string
  discount_bps: number
  ends_at: string
  timezone: string
  max_uses: number | null
  campaign_version: number
}

export type PublicVariantOffer = {
  variant_id: string
  sku: string
  public_price_cents: number
  vat_rate_bps: number
  in_review: boolean
  reward: { bps: number; cents_per_unit: number; base_cents: number } | null
  codes: {
    code: string
    discount_bps: number
    discount_cents: number
    price_cents: number
    ends_at: string
    timezone: string
    max_uses: number | null
    campaign_version: number
    min_previous_price_cents: number | null
  }[]
}

const ADMIN_KEYS = [
  "supplier_id",
  "supplier_cost_cents",
  "reference_price_cents",
  "min_margin_bps",
  "compliance_status",
  "image_rights",
  "price_list_source",
] as const

export function marginBps(rewardBaseCents: number, supplierCostCents: number): number | null {
  if (!Number.isInteger(rewardBaseCents) || rewardBaseCents <= 0) return null
  if (!Number.isInteger(supplierCostCents) || supplierCostCents < 0) return null
  return Math.floor(((rewardBaseCents - supplierCostCents) * 10000) / rewardBaseCents)
}

export function isInReview(row: EconomicsRow): boolean {
  if (row.compliance_status !== "ok") return true
  const margin = marginBps(row.reward_base_cents, row.supplier_cost_cents)
  if (margin == null || margin < row.min_margin_bps) return true
  return false
}

export function minPreviousPrice(
  observations: { cents: number; at: string }[],
  now: string,
  days = 30
): number | null {
  const end = Date.parse(now)
  const start = end - days * 24 * 60 * 60 * 1000
  const window = observations.filter((item) => {
    const at = Date.parse(item.at)
    return at >= start && at < end
  })
  if (!window.length) return null
  return Math.min(...window.map((item) => item.cents))
}

/** Storefront shape. Supplier cost, margin, compliance and image rights stay out. */
export function toPublicOffer(
  row: EconomicsRow,
  codes: PublicCode[],
  options: { referralEnabled: boolean; promoEnabled: boolean; previousPrices?: { cents: number; at: string }[]; now: string }
): PublicVariantOffer {
  const inReview = isInReview(row)
  const tier =
    inReview || !options.referralEnabled
      ? null
      : tierFor(supplierDiscountBps(row.reference_price_cents, row.supplier_cost_cents) ?? -1)
  const previous = minPreviousPrice(options.previousPrices || [], options.now)
  const offer: PublicVariantOffer = {
    variant_id: row.variant_id,
    sku: row.sku,
    public_price_cents: row.public_price_cents,
    vat_rate_bps: row.vat_rate_bps,
    in_review: inReview,
    reward:
      tier == null
        ? null
        : {
            bps: tier,
            cents_per_unit: lineRewardCents(row.reward_base_cents, 1, tier),
            base_cents: row.reward_base_cents,
          },
    codes:
      !options.promoEnabled || inReview
        ? []
        : codes.map((code) => ({
            code: code.code,
            discount_bps: code.discount_bps,
            discount_cents: discountCents(row.public_price_cents, code.discount_bps),
            price_cents: row.public_price_cents - discountCents(row.public_price_cents, code.discount_bps),
            ends_at: code.ends_at,
            timezone: code.timezone,
            max_uses: code.max_uses,
            campaign_version: code.campaign_version,
            min_previous_price_cents: previous,
          })),
  }
  for (const key of ADMIN_KEYS) {
    if (key in offer) throw new Error(`Campo admin esposto: ${key}`)
  }
  return offer
}
