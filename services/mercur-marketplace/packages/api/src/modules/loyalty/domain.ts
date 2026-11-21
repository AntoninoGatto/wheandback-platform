import { netFromGrossInclusive } from "../../lib/commerce/rules"
import { benefitFlags } from "./flags"

export const PROMO_INTERNAL_ID = "promo_internal"

export type EntryType = "accrual_pending" | "unlock" | "cancel" | "redeem" | "adjust" | "reversal" | "accrued"

export function actorId(req: { auth_context?: { actor_id?: string } }): string {
  return req.auth_context?.actor_id || ""
}

export type LedgerEntry = {
  id: string
  customer_id: string
  order_id?: string | null
  type: EntryType
  amount_cents: number
  source_entry_id?: string | null
  idempotency_key: string
  created_at: string
}

/** No silent 5% rate. Unset or invalid → no buyer cashback. */
export function cashbackRate(): number | null {
  const raw = process.env.CASHBACK_RATE
  if (raw == null || raw.trim() === "") return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) return null
  return parsed
}

export function unlockDays(): number | null {
  return benefitFlags().rewardUnlockDays
}

/** Requires an explicit rate and VAT basis points. Missing either one yields 0. */
export function accrualCents(
  productGrossInclVatCents: number,
  rate: number | null = cashbackRate(),
  vatRateBps?: number | null
): number {
  if (rate == null || rate <= 0 || vatRateBps == null) return 0
  return Math.max(0, Math.round(netFromGrossInclusive(productGrossInclVatCents, vatRateBps) * rate))
}

export function summarize(entries: LedgerEntry[]): {
  pending: number
  available: number
  used: number
} {
  const cancelled = new Set(
    entries.filter((entry) => entry.type === "cancel" && entry.source_entry_id).map((entry) => entry.source_entry_id)
  )
  const unlocked = new Set(
    entries.filter((entry) => entry.type === "unlock" && entry.source_entry_id).map((entry) => entry.source_entry_id)
  )
  const reversed = new Map<string, number>()
  for (const entry of entries) {
    if (entry.type === "reversal" && entry.source_entry_id) {
      reversed.set(entry.source_entry_id, (reversed.get(entry.source_entry_id) || 0) + entry.amount_cents)
    }
  }
  let pending = 0
  let available = 0
  let used = 0
  for (const entry of entries) {
    if (entry.type === "accrual_pending") {
      if (cancelled.has(entry.id)) continue
      const left = Math.max(0, entry.amount_cents - (reversed.get(entry.id) || 0))
      if (unlocked.has(entry.id)) available += left
      else pending += left
    } else if (entry.type === "redeem") {
      used += entry.amount_cents
      available -= entry.amount_cents
    } else if (entry.type === "adjust") {
      available += entry.amount_cents
    }
  }
  return { pending, available, used }
}

export function accrualsReadyToUnlock(entries: LedgerEntry[], now: Date, days: number | null = unlockDays()): LedgerEntry[] {
  if (days == null) return []
  const handled = new Set(
    entries
      .filter((entry) => (entry.type === "unlock" || entry.type === "cancel") && entry.source_entry_id)
      .map((entry) => entry.source_entry_id)
  )
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000
  return entries.filter(
    (entry) =>
      entry.type === "accrual_pending" &&
      !handled.has(entry.id) &&
      Date.parse(entry.created_at) <= cutoff
  )
}

export function redeemQuote(availableCents: number, requestedCents: number): number {
  if (requestedCents <= 0 || availableCents <= 0) return 0
  return Math.min(availableCents, requestedCents)
}

/** Checkout redemption stays off until LOYALTY_REDEEM_ENABLED=true. */
export function redeemAllowed(availableCents: number, requestedCents: number): number {
  if (!benefitFlags().redeemEnabled) return 0
  return redeemQuote(availableCents, requestedCents)
}

export function creditExpiryDays(): number | null {
  const raw = process.env.CREDIT_EXPIRY_DAYS
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.round(parsed)
}
