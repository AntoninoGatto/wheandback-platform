import { createHash } from "crypto"
import { accrualCents } from "./domain"

export type ReferralTier = "A" | "B" | "C"

export const DEFAULT_TIERS: Record<ReferralTier, number> = {
  A: 0.35,
  B: 0.27,
  C: 0.21,
}

export function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase()
}

export function addressFingerprint(address?: {
  postal_code?: string
  address_1?: string
  city?: string
} | null): string {
  if (!address) return ""
  const raw = `${address.postal_code || ""}|${address.address_1 || ""}|${address.city || ""}`
    .toLowerCase()
    .replace(/\s+/g, "")
  return createHash("sha256").update(raw).digest("hex")
}

export function isSelfReferral(input: {
  referrer_customer_id: string
  referred_customer_id?: string | null
  referrer_email?: string | null
  referred_email?: string | null
  referrer_payment_fingerprint?: string | null
  referred_payment_fingerprint?: string | null
  referrer_address_fingerprint?: string | null
  referred_address_fingerprint?: string | null
}): boolean {
  if (input.referred_customer_id && input.referred_customer_id === input.referrer_customer_id) {
    return true
  }
  const referrerEmail = normalizeEmail(input.referrer_email)
  const referredEmail = normalizeEmail(input.referred_email)
  if (referrerEmail && referrerEmail === referredEmail) return true
  if (
    input.referrer_payment_fingerprint &&
    input.referrer_payment_fingerprint === input.referred_payment_fingerprint
  ) {
    return true
  }
  if (
    input.referrer_address_fingerprint &&
    input.referrer_address_fingerprint === input.referred_address_fingerprint
  ) {
    return true
  }
  return false
}

export function referralRewardCents(input: {
  productGrossInclVatCents: number
  tier: ReferralTier
  tiers?: Record<ReferralTier, number>
  paidOrderIndex: number
  maxRewardedOrders: number
  selfReferral: boolean
  alreadyRewardedCentsThisMonth: number
  monthlyCapCents: number
}): number {
  if (input.selfReferral) return 0
  if (input.paidOrderIndex < 1 || input.paidOrderIndex > input.maxRewardedOrders) return 0
  const rate = (input.tiers || DEFAULT_TIERS)[input.tier]
  const reward = accrualCents(input.productGrossInclVatCents, rate)
  const room = Math.max(0, input.monthlyCapCents - input.alreadyRewardedCentsThisMonth)
  return Math.min(reward, room)
}

export function allowRequest(bucket: { count: number; resetAt: number }, now: number, limit = 20): {
  allowed: boolean
  next: { count: number; resetAt: number }
} {
  if (now >= bucket.resetAt) {
    return { allowed: true, next: { count: 1, resetAt: now + 60_000 } }
  }
  if (bucket.count >= limit) return { allowed: false, next: bucket }
  return { allowed: true, next: { count: bucket.count + 1, resetAt: bucket.resetAt } }
}
