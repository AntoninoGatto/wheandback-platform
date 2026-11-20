import { discountCents, lineRewardCents, tierFor } from "./tiers"

export type BenefitMode = "referrer" | "none" | "coupons"

export type QuoteLineInput = {
  line_id: string
  sku: string
  variant_id: string
  qty: number
  /** Gross line amount, VAT included, integer cents. */
  initial_price_cents: number
  vat_rate_bps: number
  /** Net reward base per piece (price without VAT), integer cents. */
  reward_base_cents: number
  supplier_discount_bps: number | null
  referral_bps_override?: number | null
  in_review: boolean
}

export type PromoCode = {
  code: string
  variant_id: string
  discount_bps: number
  campaign_id: string
  campaign_version: number
  starts_at: string
  ends_at: string
  status: "draft" | "approved" | "expired"
  max_uses: number | null
  uses_consumed: number
  uses_reserved: number
}

export type PersonalCode = {
  code: string
  referrer_customer_id: string
  referrer_email?: string | null
}

export type QuoteReasonName =
  | "unknown"
  | "expired"
  | "exhausted"
  | "self-referral"
  | "disabled"
  | "in_review"

export type QuoteReason = { code: string; reason: QuoteReasonName }

export type QuoteConfirmation = { line_id: string; codes: string[]; suggested: string }

export type QuoteLineOutput = {
  line_id: string
  sku: string
  qty: number
  initial_price_cents: number
  vat_rate_bps: number
  discount_cents: number
  price_paid_cents: number
  reward_cents: number
  internal_cents: number
  code: string | null
  campaign_version: number | null
  tier_bps: number | null
  reward_base_cents: number
}

export type QuoteResult = {
  mode: BenefitMode
  lines: QuoteLineOutput[]
  reasons: QuoteReason[]
  confirmations: QuoteConfirmation[]
  totals: {
    initial_price_cents: number
    discount_cents: number
    price_paid_cents: number
    reward_cents: number
    internal_cents: number
  }
}

export type QuoteInput = {
  mode: BenefitMode
  lines: QuoteLineInput[]
  now: string
  referrer_code?: string | null
  buyer_customer_id?: string | null
  buyer_email?: string | null
  coupon_codes?: string[]
  line_choices?: { line_id: string; code: string }[]
  promos: PromoCode[]
  personal_codes: PersonalCode[]
  referral_enabled: boolean
  promo_enabled: boolean
  referral_cap_cents?: number | null
  already_rewarded_cents?: number
}

function norm(code: string | null | undefined): string {
  return (code || "").trim().toUpperCase()
}

function pushReason(reasons: QuoteReason[], code: string, reason: QuoteReasonName) {
  if (reasons.some((item) => item.code === code && item.reason === reason)) return
  reasons.push({ code, reason })
}

type Classified =
  | { ok: true; promo: PromoCode }
  | { ok: false; reason: QuoteReasonName }

function classifyPromo(promo: PromoCode | undefined, nowMs: number, personal: Set<string>): Classified {
  if (!promo) return { ok: false, reason: "unknown" }
  if (personal.has(norm(promo.code))) return { ok: false, reason: "unknown" }
  if (promo.status === "expired" || nowMs >= Date.parse(promo.ends_at)) return { ok: false, reason: "expired" }
  if (promo.status !== "approved" || nowMs < Date.parse(promo.starts_at)) return { ok: false, reason: "unknown" }
  if (
    promo.max_uses != null &&
    promo.uses_consumed + promo.uses_reserved >= promo.max_uses
  ) {
    return { ok: false, reason: "exhausted" }
  }
  if (promo.discount_bps < 300 || promo.discount_bps > 1300) return { ok: false, reason: "unknown" }
  return { ok: true, promo }
}

function effectiveTier(line: QuoteLineInput): number | null {
  if (line.in_review) return null
  if (line.referral_bps_override != null && line.referral_bps_override > 0) return line.referral_bps_override
  if (line.supplier_discount_bps == null) return null
  return tierFor(line.supplier_discount_bps)
}

function applyCap(lines: QuoteLineOutput[], capCents: number | null | undefined, already: number) {
  if (capCents == null) return
  let room = Math.max(0, capCents - already)
  for (const line of lines) {
    if (line.reward_cents <= room) {
      room -= line.reward_cents
      continue
    }
    line.reward_cents = room
    room = 0
  }
}

function blankLine(line: QuoteLineInput, tier: number | null): QuoteLineOutput {
  return {
    line_id: line.line_id,
    sku: line.sku,
    qty: line.qty,
    initial_price_cents: line.initial_price_cents,
    vat_rate_bps: line.vat_rate_bps,
    discount_cents: 0,
    price_paid_cents: line.initial_price_cents,
    reward_cents: 0,
    internal_cents: 0,
    code: null,
    campaign_version: null,
    tier_bps: tier,
    reward_base_cents: line.reward_base_cents,
  }
}

/**
 * One cart, one mode. Integer cents, one rounding per line.
 * Coupons zero the reward and the internal quota for the whole order.
 */
export function quoteCart(input: QuoteInput): QuoteResult {
  const nowMs = Date.parse(input.now)
  const reasons: QuoteReason[] = []
  const confirmations: QuoteConfirmation[] = []
  const personal = new Set(input.personal_codes.map((item) => norm(item.code)))
  const lines = input.lines.map((line) => blankLine(line, effectiveTier(line)))

  if (input.mode === "referrer") {
    const code = norm(input.referrer_code)
    if (!input.referral_enabled) {
      if (code) pushReason(reasons, code, "disabled")
    } else if (!code) {
      // Empty code is mode `none`, not an error on the referrer path.
    } else if (input.promos.some((promo) => norm(promo.code) === code)) {
      pushReason(reasons, code, "unknown")
    } else {
      const owner = input.personal_codes.find((item) => norm(item.code) === code)
      if (!owner) pushReason(reasons, code, "unknown")
      else {
        const sameId =
          !!input.buyer_customer_id && input.buyer_customer_id === owner.referrer_customer_id
        const buyerEmail = (input.buyer_email || "").trim().toLowerCase()
        const ownerEmail = (owner.referrer_email || "").trim().toLowerCase()
        const sameEmail = !!buyerEmail && buyerEmail === ownerEmail
        if (sameId || sameEmail) pushReason(reasons, code, "self-referral")
        else {
          for (const line of lines) {
            if (line.tier_bps == null) continue
            const source = input.lines.find((item) => item.line_id === line.line_id)!
            line.reward_cents = lineRewardCents(source.reward_base_cents, source.qty, line.tier_bps)
            line.code = code
          }
          applyCap(lines, input.referral_cap_cents, input.already_rewarded_cents || 0)
        }
      }
    }
  }

  if (input.mode === "none") {
    for (const line of lines) {
      if (line.tier_bps == null) continue
      const source = input.lines.find((item) => item.line_id === line.line_id)!
      line.internal_cents = lineRewardCents(source.reward_base_cents, source.qty, line.tier_bps)
    }
  }

  if (input.mode === "coupons") {
    const submitted = [
      ...new Set(
        [...(input.coupon_codes || []), ...(input.line_choices || []).map((choice) => choice.code)]
          .map(norm)
          .filter(Boolean)
      ),
    ]
    const restrict = submitted.length > 0
    if (!input.promo_enabled) {
      for (const code of submitted) pushReason(reasons, code, "disabled")
    } else {
      for (const code of submitted) {
        if (personal.has(code)) {
          pushReason(reasons, code, "unknown")
          continue
        }
        const matches = input.promos.filter((promo) => norm(promo.code) === code)
        if (!matches.length) {
          pushReason(reasons, code, "unknown")
          continue
        }
        const classified = matches.map((promo) => classifyPromo(promo, nowMs, personal))
        if (!classified.some((item) => item.ok)) {
          const reason = classified.find((item) => !item.ok) as { ok: false; reason: QuoteReasonName }
          pushReason(reasons, code, reason.reason)
        }
      }

      const choiceByLine = new Map(
        (input.line_choices || []).map((choice) => [choice.line_id, norm(choice.code)])
      )
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index]
        const source = input.lines[index]
        if (source.in_review) {
          const targeted = input.promos.filter(
            (promo) =>
              promo.variant_id === source.variant_id &&
              (!restrict || submitted.includes(norm(promo.code)))
          )
          if (targeted.length) pushReason(reasons, norm(targeted[0].code), "in_review")
          continue
        }
        const candidates = input.promos.filter((promo) => {
          if (promo.variant_id !== source.variant_id) return false
          if (restrict && !submitted.includes(norm(promo.code))) return false
          return classifyPromo(promo, nowMs, personal).ok
        })
        const uniqueCodes = [...new Set(candidates.map((promo) => norm(promo.code)))]
        if (!uniqueCodes.length) continue
        const chosenCode = choiceByLine.get(line.line_id)
        let promo: PromoCode | undefined
        if (chosenCode) {
          promo = candidates.find((item) => norm(item.code) === chosenCode)
          if (!promo) continue
        } else if (uniqueCodes.length > 1) {
          const ranked = [...candidates].sort((a, b) => b.discount_bps - a.discount_bps || norm(a.code).localeCompare(norm(b.code)))
          confirmations.push({
            line_id: line.line_id,
            codes: uniqueCodes,
            suggested: norm(ranked[0].code),
          })
          continue
        } else {
          promo = candidates[0]
        }
        if (!promo) continue
        line.discount_cents = discountCents(line.initial_price_cents, promo.discount_bps)
        line.price_paid_cents = line.initial_price_cents - line.discount_cents
        line.code = norm(promo.code)
        line.campaign_version = promo.campaign_version
      }
    }
    for (const line of lines) {
      line.reward_cents = 0
      line.internal_cents = 0
    }
  }

  const totals = lines.reduce(
    (sum, line) => ({
      initial_price_cents: sum.initial_price_cents + line.initial_price_cents,
      discount_cents: sum.discount_cents + line.discount_cents,
      price_paid_cents: sum.price_paid_cents + line.price_paid_cents,
      reward_cents: sum.reward_cents + line.reward_cents,
      internal_cents: sum.internal_cents + line.internal_cents,
    }),
    { initial_price_cents: 0, discount_cents: 0, price_paid_cents: 0, reward_cents: 0, internal_cents: 0 }
  )
  return { mode: input.mode, lines, reasons, confirmations, totals }
}

export function quoteFingerprint(result: QuoteResult): string {
  return JSON.stringify(
    result.lines.map((line) => [
      line.line_id,
      line.price_paid_cents,
      line.discount_cents,
      line.reward_cents,
      line.internal_cents,
      line.code,
      line.campaign_version,
    ])
  )
}

export function quoteChanged(previous: string | null, next: string): boolean {
  return previous != null && previous !== next
}

export type RewardMovement = {
  customer_id: string
  order_id: string
  line_id: string
  entry_type: "accrual_pending" | "accrued"
  amount_cents: number
  idempotency_key: string
}

/** One movement per line and beneficiary. Guests are allowed: the buyer id is not required. */
export function buildRewardEntries(input: {
  orderId: string
  mode: BenefitMode
  referrerCustomerId?: string | null
  lines: QuoteLineOutput[]
}): RewardMovement[] {
  const movements: RewardMovement[] = []
  for (const line of input.lines) {
    if (input.mode === "referrer" && input.referrerCustomerId && line.reward_cents > 0) {
      movements.push({
        customer_id: input.referrerCustomerId,
        order_id: input.orderId,
        line_id: line.line_id,
        entry_type: "accrual_pending",
        amount_cents: line.reward_cents,
        idempotency_key: `reward:${input.orderId}:${line.line_id}`,
      })
    }
    if (input.mode === "none" && line.internal_cents > 0) {
      movements.push({
        customer_id: "promo_internal",
        order_id: input.orderId,
        line_id: line.line_id,
        entry_type: "accrued",
        amount_cents: line.internal_cents,
        idempotency_key: `reward:${input.orderId}:${line.line_id}`,
      })
    }
  }
  return movements
}
