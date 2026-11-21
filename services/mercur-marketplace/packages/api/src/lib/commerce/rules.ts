import { commerceConfig, type CommerceConfig } from "./config"

export type ShippingMethod = "standard" | "express"

export function freeShippingThresholdCents(config: CommerceConfig = commerceConfig()): number {
  return config.freeShippingThresholdCents
}

export type ShippingPriceRule = {
  attribute: "item_total"
  operator: "gte"
  value: number
}

/** Medusa stores shipping amounts in major currency units (€10 is `amount: 10`). */
export type ItalyShippingPrice =
  | { currency_code: "eur" | "usd"; amount: number; rules?: ShippingPriceRule[] }
  | { region_id: string; amount: number; rules?: ShippingPriceRule[] }

/**
 * Flat prices written by the Italy seed.
 * Standard also gets a 0 amount when cart `item_total` is at least the threshold.
 * Medusa picks the price with the most matching rules, so the 0 row wins only above the threshold.
 * `item_total` and `amount` are major units (euros), the same unit as the demo seed (`amount: 10` = €10).
 * The USD row stays at the demo placeholder of 10 so a currency the Italy checkout does not use is not dropped.
 */
export function italyShippingOptionPrices(input: {
  kind: ShippingMethod
  regionId?: string
  thresholdCents?: number
  config?: CommerceConfig
}): ItalyShippingPrice[] {
  const config = input.config ?? commerceConfig()
  const amount =
    (input.kind === "express" ? config.shippingExpressCents : config.shippingStandardCents) / 100
  const thresholdMajor = (input.thresholdCents ?? config.freeShippingThresholdCents) / 100
  const prices: ItalyShippingPrice[] = [
    { currency_code: "eur", amount },
    { currency_code: "usd", amount: 10 },
  ]
  if (input.kind === "standard") {
    prices.push({
      currency_code: "eur",
      amount: 0,
      rules: [{ attribute: "item_total", operator: "gte", value: thresholdMajor }],
    })
  }
  if (input.regionId) {
    prices.push({ region_id: input.regionId, amount })
    if (input.kind === "standard") {
      prices.push({
        region_id: input.regionId,
        amount: 0,
        rules: [{ attribute: "item_total", operator: "gte", value: thresholdMajor }],
      })
    }
  }
  return prices
}

/** Match the demo options ("Standard Shipping" / "Express Shipping") and their type codes. */
export function shippingOptionKind(option: {
  name?: string | null
  typeCode?: string | null
}): ShippingMethod | null {
  const code = (option.typeCode || "").toLowerCase()
  const name = (option.name || "").toLowerCase()
  if (code === "express" || name.includes("express")) return "express"
  if (code === "standard" || name.includes("standard")) return "standard"
  return null
}

/** Standard shipping is included in the service above the threshold. Never described as free. */
export function shippingPriceCents(
  method: ShippingMethod,
  productGrossCents: number,
  threshold?: number,
  config: CommerceConfig = commerceConfig()
): number {
  const appliedThreshold = threshold ?? config.freeShippingThresholdCents
  if (method === "standard" && productGrossCents >= appliedThreshold) return 0
  return method === "express" ? config.shippingExpressCents : config.shippingStandardCents
}

/** Gross inclusive cents → net cents. `vatRateBps` is per product or per country (2200 = 22%). */
export function netFromGrossInclusive(grossCents: number, vatRateBps: number): number {
  if (grossCents <= 0 || vatRateBps < 0) return 0
  return Math.round((grossCents * 10000) / (10000 + vatRateBps))
}

export type ItAddress = {
  first_name: string
  last_name: string
  address_1: string
  city: string
  postal_code: string
  province: string
  phone: string
  country_code: string
  codice_fiscale?: string
}

const CAP = /^\d{5}$/
const PROVINCE = /^[A-Za-z]{2}$/
const PHONE = /^[0-9+\s]{6,20}$/
const CF = /^[A-Za-z0-9]{16}$/

export function validateItAddress(input: ItAddress): string[] {
  const errors: string[] = []
  if (!input.first_name?.trim()) errors.push("Nome obbligatorio")
  if (!input.last_name?.trim()) errors.push("Cognome obbligatorio")
  if (!input.address_1?.trim()) errors.push("Indirizzo obbligatorio")
  if (!input.city?.trim()) errors.push("Città obbligatoria")
  if (!CAP.test(input.postal_code || "")) errors.push("CAP non valido")
  if (!PROVINCE.test(input.province || "")) errors.push("Provincia non valida")
  if (!PHONE.test(input.phone || "")) errors.push("Telefono non valido")
  if ((input.country_code || "").toLowerCase() !== "it") errors.push("Paese deve essere IT")
  if (input.codice_fiscale && !CF.test(input.codice_fiscale)) {
    errors.push("Codice fiscale non valido")
  }
  return errors
}

export function paymentsConfigured(env: {
  STRIPE_API_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
} = process.env): boolean {
  return Boolean(env.STRIPE_API_KEY && env.STRIPE_WEBHOOK_SECRET)
}
