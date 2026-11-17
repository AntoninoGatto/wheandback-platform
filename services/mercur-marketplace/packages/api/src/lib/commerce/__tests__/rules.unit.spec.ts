import {
  IT_VAT_RATE,
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

  it("strips 22% IVA from inclusive prices", () => {
    expect(netFromGrossInclusive(12200, IT_VAT_RATE)).toBe(10000)
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
