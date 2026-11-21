import { createHash } from "crypto"
import { netFromGrossInclusive } from "../../lib/commerce/rules"
import { lineRewardCents } from "./tiers"

export type ReferralTier = "A" | "B" | "C"

export const TIER_BPS: Record<ReferralTier, number> = {
  A: 3500,
  B: 2700,
  C: 2100,
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

/**
 * Reward on every order that names this referrer. There is no permanent invitee link
 * and no "first order only" gate. `monthlyCapCents` null means no cap.
 */
export function referralRewardCents(input: {
  productGrossInclVatCents?: number
  rewardBaseCents?: number
  vatRateBps?: number
  tier: ReferralTier
  tierBps?: number
  qty?: number
  paidOrderIndex?: number
  maxRewardedOrders?: number
  selfReferral: boolean
  alreadyRewardedCentsThisMonth?: number
  monthlyCapCents?: number | null
}): number {
  if (input.selfReferral) return 0
  const base =
    input.rewardBaseCents ??
    (input.productGrossInclVatCents != null && input.vatRateBps != null
      ? netFromGrossInclusive(input.productGrossInclVatCents, input.vatRateBps)
      : 0)
  const reward = lineRewardCents(base, input.qty ?? 1, input.tierBps ?? TIER_BPS[input.tier])
  if (input.monthlyCapCents == null) return reward
  const room = Math.max(0, input.monthlyCapCents - (input.alreadyRewardedCentsThisMonth || 0))
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
