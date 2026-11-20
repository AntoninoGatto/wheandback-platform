export type CommerceConfig = {
  shippingStandardCents: number
  shippingExpressCents: number
  freeShippingThresholdCents: number
  /** ISO-2 country → VAT rate in basis points. Product rates override this. */
  vatRateBpsByCountry: Record<string, number>
}

function intEnv(value: string | undefined, fallback: number): number {
  if (value == null || value.trim() === "") return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.round(parsed)
}

/** Shipping placeholders and VAT live here, not inside the price functions. */
export function commerceConfig(env: NodeJS.ProcessEnv = process.env): CommerceConfig {
  const vatRateBpsByCountry: Record<string, number> = {
    it: intEnv(env.VAT_RATE_BPS_IT, 2200),
  }
  if (env.VAT_RATE_BPS_BY_COUNTRY) {
    try {
      const parsed = JSON.parse(env.VAT_RATE_BPS_BY_COUNTRY) as Record<string, number>
      for (const [country, rate] of Object.entries(parsed)) {
        if (Number.isFinite(Number(rate))) vatRateBpsByCountry[country.toLowerCase()] = Math.round(Number(rate))
      }
    } catch {
      // Ignore a malformed override. The per-country map stays at the configured defaults.
    }
  }
  return {
    shippingStandardCents: intEnv(env.SHIPPING_STANDARD_CENTS, 590),
    shippingExpressCents: intEnv(env.SHIPPING_EXPRESS_CENTS, 990),
    freeShippingThresholdCents: intEnv(env.SHIPPING_FREE_THRESHOLD_CENTS, 4900),
    vatRateBpsByCountry,
  }
}

/** Product VAT wins. Otherwise the country rate. Missing both → null (no assumed 22%). */
export function resolveVatRateBps(
  productVatBps: number | null | undefined,
  countryCode: string | null | undefined,
  config: CommerceConfig = commerceConfig()
): number | null {
  if (productVatBps != null && Number.isFinite(productVatBps) && productVatBps >= 0) {
    return Math.round(productVatBps)
  }
  if (!countryCode) return null
  const countryRate = config.vatRateBpsByCountry[countryCode.toLowerCase()]
  return countryRate == null ? null : countryRate
}
