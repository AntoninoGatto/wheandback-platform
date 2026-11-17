/** Placeholder carrier prices until a real IT courier is contracted. Amounts are IVA-inclusive EUR cents. */
export const SHIPPING_STANDARD_CENTS = 590
export const SHIPPING_EXPRESS_CENTS = 990
export const DEFAULT_FREE_SHIPPING_THRESHOLD_CENTS = 4900
export const IT_VAT_RATE = 0.22

export type ShippingMethod = "standard" | "express"

export function freeShippingThresholdCents(): number {
  const raw = Number(process.env.SHIPPING_FREE_THRESHOLD_CENTS)
  if (!Number.isFinite(raw) || raw < 0) return DEFAULT_FREE_SHIPPING_THRESHOLD_CENTS
  return Math.round(raw)
}

/** Standard shipping is included in the service above the threshold. Never described as free. */
export function shippingPriceCents(
  method: ShippingMethod,
  productGrossCents: number,
  threshold = freeShippingThresholdCents()
): number {
  if (method === "standard" && productGrossCents >= threshold) return 0
  return method === "express" ? SHIPPING_EXPRESS_CENTS : SHIPPING_STANDARD_CENTS
}

/** Prices are IVA-inclusive. Net excludes VAT. */
export function netFromGrossInclusive(grossCents: number, vatRate = IT_VAT_RATE): number {
  if (grossCents <= 0) return 0
  return Math.round(grossCents / (1 + vatRate))
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
