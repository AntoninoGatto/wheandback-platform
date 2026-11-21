import { commerceConfig } from "../config"
import { toCents } from "../money"
import {
  italyShippingOptionPrices,
  netFromGrossInclusive,
  paymentsConfigured,
  shippingOptionKind,
  shippingPriceCents,
  validateItAddress,
} from "../rules"

const address = {
  first_name: "Ada",
  last_name: "Lovelace",
  address_1: "Via Roma 1",
  city: "Milano",
  postal_code: "20121",
  province: "MI",
  phone: "+39 333 1234567",
  country_code: "it",
}

describe("commerce rules", () => {
  it("includes standard shipping in the service above the threshold", () => {
    expect(shippingPriceCents("standard", 4900, 4900)).toBe(0)
    expect(shippingPriceCents("standard", 4899, 4900)).toBe(590)
    expect(shippingPriceCents("express", 10000, 4900)).toBe(990)
  })

  it("strips VAT using an explicit basis-point rate", () => {
    expect(netFromGrossInclusive(12200, 2200)).toBe(10000)
    expect(netFromGrossInclusive(11900, 1900)).toBe(10000)
    const de = commerceConfig({ VAT_RATE_BPS_BY_COUNTRY: "{\"de\":1900}", SHIPPING_STANDARD_CENTS: "700" })
    expect(de.vatRateBpsByCountry.de).toBe(1900)
    expect(de.shippingStandardCents).toBe(700)
    expect(shippingPriceCents("express", 10000, 4900, de)).toBe(990)
    expect(shippingPriceCents("standard", 100, 4900, de)).toBe(700)
  })

  it("converts 1200 euro with an explicit unit", () => {
    expect(toCents(1200, "major")).toBe(120000)
    expect(toCents(1200, "cents")).toBe(1200)
  })

  it("accepts a complete Italian address and an optional fiscal code", () => {
    expect(validateItAddress(address)).toEqual([])
    expect(validateItAddress({ ...address, codice_fiscale: "RSSMRA85T10A562S" })).toEqual([])
    expect(validateItAddress({ ...address, postal_code: "201" })).toContain("CAP non valido")
    expect(validateItAddress({ ...address, codice_fiscale: "ABC" })).toContain(
      "Codice fiscale non valido"
    )
  })

  it("prices Italy shipping in euros and zeroes standard above the threshold", () => {
    const standard = italyShippingOptionPrices({
      kind: "standard",
      regionId: "reg_it",
      thresholdCents: 4900,
    })
    expect(standard).toEqual([
      { currency_code: "eur", amount: 5.9 },
      { currency_code: "usd", amount: 10 },
      {
        currency_code: "eur",
        amount: 0,
        rules: [{ attribute: "item_total", operator: "gte", value: 49 }],
      },
      { region_id: "reg_it", amount: 5.9 },
      {
        region_id: "reg_it",
        amount: 0,
        rules: [{ attribute: "item_total", operator: "gte", value: 49 }],
      },
    ])
    const express = italyShippingOptionPrices({ kind: "express", thresholdCents: 4900 })
    expect(express).toEqual([
      { currency_code: "eur", amount: 9.9 },
      { currency_code: "usd", amount: 10 },
    ])
    expect(shippingOptionKind({ name: "Standard Shipping", typeCode: "standard" })).toBe("standard")
    expect(shippingOptionKind({ name: "Express Shipping" })).toBe("express")
    expect(shippingOptionKind({ name: "Ritiro" })).toBeNull()
  })

  it("treats missing Stripe secrets as payments not configured", () => {
    expect(paymentsConfigured({})).toBe(false)
    expect(
      paymentsConfigured({ STRIPE_API_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x" })
    ).toBe(true)
  })
})
