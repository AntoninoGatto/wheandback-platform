import { internalBalance, toAccountingCsv } from "../accounting"
import { campaignOverlapError, inclusiveCalendarEndUtc, nextCampaignStatus } from "../campaigns"
import { isInReview, toPublicOffer, type EconomicsRow } from "../economics"
import { buildRewardEntries, quoteCart, type PromoCode, type QuoteLineInput } from "../quote"
import { reservationDecision } from "../reservations"
import { allocateReturns } from "../returns"
import { classifyImport, isBannedCategory } from "../supplier-import"
import { lineRewardCents, supplierDiscountBps, tierFor } from "../tiers"

const novEnd = inclusiveCalendarEndUtc("2026-11-30")
const decStart = novEnd
const decEnd = inclusiveCalendarEndUtc("2026-12-31")

/**
 * Assumed basket, because the owner's 94-scenario kit was not attached.
 * Three lines, VAT 22%, bases 100 / 50 / 20 €, tiers 35 / 27 / 21.
 * November codes 13% / 8% / 3%. December codes 10% / 5% and the small line uncovered.
 * Those inputs are what produce 52,70 €, 185,93 € and 192,15 €. They are not adjusted after the fact.
 */
const dossierLines: QuoteLineInput[] = [
  {
    line_id: "lamp",
    sku: "LAMP",
    variant_id: "v_lamp",
    qty: 1,
    initial_price_cents: 12200,
    vat_rate_bps: 2200,
    reward_base_cents: 10000,
    supplier_discount_bps: 5000,
    in_review: false,
  },
  {
    line_id: "mid",
    sku: "MID",
    variant_id: "v_mid",
    qty: 1,
    initial_price_cents: 6100,
    vat_rate_bps: 2200,
    reward_base_cents: 5000,
    supplier_discount_bps: 4200,
    in_review: false,
  },
  {
    line_id: "small",
    sku: "SMALL",
    variant_id: "v_small",
    qty: 1,
    initial_price_cents: 2440,
    vat_rate_bps: 2200,
    reward_base_cents: 2000,
    supplier_discount_bps: 3600,
    in_review: false,
  },
]

function promo(
  code: string,
  variant_id: string,
  discount_bps: number,
  starts_at: string,
  ends_at: string
): PromoCode {
  return {
    code,
    variant_id,
    discount_bps,
    campaign_id: code,
    campaign_version: 1,
    starts_at,
    ends_at,
    status: "approved",
    max_uses: null,
    uses_consumed: 0,
    uses_reserved: 0,
  }
}

const promos: PromoCode[] = [
  promo("LAMP13", "v_lamp", 1300, "2026-11-01T00:00:00.000Z", novEnd),
  promo("MID8", "v_mid", 800, "2026-11-01T00:00:00.000Z", novEnd),
  promo("SMALL3", "v_small", 300, "2026-11-01T00:00:00.000Z", novEnd),
  promo("LAMP10", "v_lamp", 1000, decStart, decEnd),
  promo("MID5", "v_mid", 500, decStart, decEnd),
]

const baseQuote = {
  lines: dossierLines,
  promos,
  personal_codes: [{ code: "NINO", referrer_customer_id: "cus_nino", referrer_email: "nino@example.com" }],
  referral_enabled: true,
  promo_enabled: true,
  referral_cap_cents: null,
}

describe("tiers", () => {
  it("keeps the edge below the next tier when the bps are not rounded first", () => {
    expect(tierFor(3599)).toBeNull()
    expect(tierFor(3600)).toBe(2100)
    expect(tierFor(4199)).toBe(2100)
    expect(tierFor(4200)).toBe(2700)
    expect(tierFor(4999)).toBe(2700)
    expect(tierFor(5000)).toBe(3500)
    expect(supplierDiscountBps(100000, 64005)).toBe(3599)
    expect(tierFor(supplierDiscountBps(100000, 64005) as number)).toBeNull()
    expect(tierFor(35.99)).toBeNull()
  })

  it("rounds the line once", () => {
    expect(lineRewardCents(1, 3, 3500)).toBe(1)
    expect(lineRewardCents(10000, 1, 3500)).toBe(3500)
  })
})

describe("quoteCart dossier basket", () => {
  it("pays the referrer 52.70 on every order and blocks self-referral", () => {
    const quoted = quoteCart({
      ...baseQuote,
      mode: "referrer",
      now: "2026-11-15T12:00:00.000Z",
      referrer_code: "NINO",
      buyer_customer_id: "cus_buyer",
    })
    expect(quoted.totals.reward_cents).toBe(5270)
    expect(quoted.totals.internal_cents).toBe(0)
    expect(quoted.totals.price_paid_cents).toBe(20740)
    const again = quoteCart({
      ...baseQuote,
      mode: "referrer",
      now: "2026-11-15T12:00:00.000Z",
      referrer_code: "NINO",
      buyer_customer_id: "cus_other",
    })
    expect(again.totals.reward_cents).toBe(5270)
    const self = quoteCart({
      ...baseQuote,
      mode: "referrer",
      now: "2026-11-15T12:00:00.000Z",
      referrer_code: "NINO",
      buyer_customer_id: "cus_nino",
    })
    expect(self.totals.reward_cents).toBe(0)
    expect(self.reasons).toEqual([{ code: "NINO", reason: "self-referral" }])
  })

  it("sends the same 52.70 to the internal budget when the field is empty", () => {
    const quoted = quoteCart({
      ...baseQuote,
      mode: "none",
      now: "2026-11-15T12:00:00.000Z",
    })
    expect(quoted.totals.internal_cents).toBe(5270)
    expect(quoted.totals.reward_cents).toBe(0)
    expect(quoted.totals.price_paid_cents).toBe(20740)
  })

  it("prices November coupons at 185.93 and December at 192.15", () => {
    const november = quoteCart({
      ...baseQuote,
      mode: "coupons",
      now: "2026-11-15T12:00:00.000Z",
      coupon_codes: ["LAMP13", "MID8", "SMALL3"],
    })
    expect(november.totals.price_paid_cents).toBe(18593)
    expect(november.totals.reward_cents).toBe(0)
    expect(november.totals.internal_cents).toBe(0)
    const december = quoteCart({
      ...baseQuote,
      mode: "coupons",
      now: "2026-12-15T12:00:00.000Z",
      coupon_codes: ["LAMP10", "MID5", "LAMP13"],
    })
    expect(december.totals.price_paid_cents).toBe(19215)
    expect(december.reasons).toContainEqual({ code: "LAMP13", reason: "expired" })
    expect(december.lines.find((line) => line.line_id === "lamp")?.code).toBe("LAMP10")
  })

  it("keeps a valid code when another code is unknown", () => {
    const quoted = quoteCart({
      ...baseQuote,
      mode: "coupons",
      now: "2026-11-15T12:00:00.000Z",
      coupon_codes: ["LAMP13", "NOPE"],
    })
    expect(quoted.reasons).toContainEqual({ code: "NOPE", reason: "unknown" })
    expect(quoted.lines.find((line) => line.line_id === "lamp")?.discount_cents).toBe(1586)
    expect(quoted.lines.find((line) => line.line_id === "lamp")?.price_paid_cents).toBe(10614)
  })

  it("asks for confirmation when two codes cover one line and suggests the best", () => {
    const quoted = quoteCart({
      ...baseQuote,
      mode: "coupons",
      now: "2026-11-15T12:00:00.000Z",
      promos: [
        ...promos,
        promo("LAMP10NOV", "v_lamp", 1000, "2026-11-01T00:00:00.000Z", novEnd),
      ],
      coupon_codes: ["LAMP13", "LAMP10NOV"],
    })
    expect(quoted.confirmations).toEqual([
      { line_id: "lamp", codes: ["LAMP13", "LAMP10NOV"], suggested: "LAMP13" },
    ])
    expect(quoted.lines.find((line) => line.line_id === "lamp")?.discount_cents).toBe(0)
    const chosen = quoteCart({
      ...baseQuote,
      mode: "coupons",
      now: "2026-11-15T12:00:00.000Z",
      promos: [
        ...promos,
        promo("LAMP10NOV", "v_lamp", 1000, "2026-11-01T00:00:00.000Z", novEnd),
      ],
      coupon_codes: ["LAMP13", "LAMP10NOV"],
      line_choices: [{ line_id: "lamp", code: "LAMP10NOV" }],
    })
    expect(chosen.lines.find((line) => line.line_id === "lamp")?.code).toBe("LAMP10NOV")
    expect(chosen.confirmations).toEqual([])
  })
})

describe("campaigns, offers, import, returns", () => {
  it("ends 30 November inclusive at Rome midnight on 1 December", () => {
    expect(novEnd).toBe("2026-11-30T23:00:00.000Z")
    expect(nextCampaignStatus("approved", novEnd, "2026-11-30T22:59:00.000Z")).toBeNull()
    expect(nextCampaignStatus("approved", novEnd, novEnd)).toBe("expired")
  })

  it("rejects an overlapping code on the same variant and a personal-code clash", () => {
    const window = {
      id: "c1",
      public_code: "LAMP13",
      status: "approved" as const,
      starts_at: "2026-11-01T00:00:00.000Z",
      ends_at: novEnd,
      lines: [{ variant_id: "v_lamp", discount_bps: 1300 }],
    }
    expect(
      campaignOverlapError(
        [window],
        { ...window, id: "c2" },
        []
      )
    ).toMatch(/Sovrapposizione/)
    expect(campaignOverlapError([], { ...window, public_code: "NINO" }, ["NINO"])).toMatch(/namespace/)
    expect(
      campaignOverlapError(
        [window],
        { ...window, id: "c3", public_code: "ALTRO" },
        []
      )
    ).toBeNull()
  })

  it("hides supplier economics and drops benefits under the minimum margin", () => {
    const row: EconomicsRow = {
      variant_id: "v_lamp",
      sku: "LAMP",
      supplier_id: "sup",
      price_list_source: "csv",
      price_list_date: "2026-11-01",
      supplier_cost_cents: 5000,
      reference_price_cents: 10000,
      reference_basis: "net",
      vat_rate_bps: 2200,
      public_price_cents: 12200,
      reward_base_cents: 10000,
      min_margin_bps: 1000,
      compliance_status: "ok",
      image_rights: "licensed",
    }
    const offer = toPublicOffer(
      row,
      [
        {
          code: "LAMP13",
          discount_bps: 1300,
          ends_at: novEnd,
          timezone: "Europe/Rome",
          max_uses: 10,
          campaign_version: 3,
        },
      ],
      { referralEnabled: true, promoEnabled: true, now: "2026-11-15T00:00:00.000Z" }
    )
    expect(offer.reward).toEqual({ bps: 3500, cents_per_unit: 3500, base_cents: 10000 })
    expect(offer.codes[0].discount_cents).toBe(1586)
    expect(offer.codes[0].price_cents).toBe(10614)
    expect(offer.codes[0].min_previous_price_cents).toBeNull()
    expect(JSON.stringify(offer)).not.toMatch(/supplier_cost|image_rights|compliance/)
    expect(isInReview({ ...row, min_margin_bps: 6000 })).toBe(true)
    expect(
      toPublicOffer(row, [], {
        referralEnabled: false,
        promoEnabled: false,
        now: "2026-11-15T00:00:00.000Z",
      }).reward
    ).toBeNull()
  })

  it("sends banned, incomplete and non-compliant rows to draft", () => {
    expect(isBannedCategory("Antiparassitari cane")).toBe(true)
    expect(isBannedCategory("Rodenticidi")).toBe(true)
    expect(isBannedCategory("Farmaco veterinario")).toBe(true)
    const csv = [
      "sku,variant_id,supplier_id,supplier_cost_cents,reference_price_cents,reference_basis,vat_rate_bps,public_price_cents,reward_base_cents,min_margin_bps,compliance_status,category",
      "OK,v1,s1,5000,10000,net,2200,12200,10000,1000,ok,lampade",
      "BAD,v2,s1,100,200,net,2200,300,200,1000,missing,lampade",
      "VET,v3,s1,100,200,net,2200,300,200,1000,ok,farmaci veterinari",
    ].join("\n")
    const rows = classifyImport(csv)
    expect(rows[0].blocked).toBe(false)
    expect(rows[0].status).toBe("draft")
    expect(rows[1].blocked).toBe(true)
    expect(rows[2].reasons).toContain("categoria non ammessa")
  })

  it("reserves only the last use and makes partial returns sum to the line", () => {
    expect(reservationDecision({ maxUses: 5, consumed: 3, reservedByOthers: 1 })).toBe("reserve-last")
    expect(reservationDecision({ maxUses: 5, consumed: 5, reservedByOthers: 0 })).toBe("exhausted")
    expect(reservationDecision({ maxUses: null, consumed: 9, reservedByOthers: 0 })).toBe("open")
    const parts = allocateReturns({
      pricePaidCents: 10614,
      rewardCents: 3500,
      internalCents: 0,
      priceParts: [5000, 5614],
    })
    expect(parts.reduce((sum, part) => sum + part.price_cents, 0)).toBe(10614)
    expect(parts.reduce((sum, part) => sum + part.reward_cents, 0)).toBe(3500)
    expect(parts.reduce((sum, part) => sum + part.internal_cents, 0)).toBe(0)
  })

  it("writes guest referrer movements and the internal balance without a payout", () => {
    const quoted = quoteCart({
      ...baseQuote,
      mode: "referrer",
      now: "2026-11-15T12:00:00.000Z",
      referrer_code: "NINO",
      buyer_customer_id: null,
    })
    const entries = buildRewardEntries({
      orderId: "order_1",
      mode: "referrer",
      referrerCustomerId: "cus_nino",
      lines: quoted.lines,
    })
    expect(entries).toHaveLength(3)
    expect(entries[0].idempotency_key).toBe("reward:order_1:lamp")
    expect(entries.every((entry) => entry.customer_id === "cus_nino")).toBe(true)
    const balance = internalBalance([
      { type: "accrued", amount_cents: 5270 },
      { type: "adjustment", amount_cents: -100 },
      { type: "committed", amount_cents: 1000 },
      { type: "spent", amount_cents: 500 },
    ])
    expect(balance).toEqual({ accrued: 5270, adjustments: -100, committed: 1000, spent: 500, available: 3670 })
    const csv = toAccountingCsv([
      {
        date: "2026-11-20",
        order_id: "order_1",
        kind: "reward",
        sku: "LAMP",
        amount_cents: 3500,
        currency: "eur",
        beneficiary: "cus_nino",
        note: "premio",
      },
    ])
    expect(csv.split("\n")[0]).toBe("date,order_id,kind,sku,amount_cents,currency,beneficiary,note")
    expect(csv).toContain("3500")
  })
})
