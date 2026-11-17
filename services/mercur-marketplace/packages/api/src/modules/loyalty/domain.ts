import { netFromGrossInclusive } from "../../lib/commerce/rules"

export const DEFAULT_CASHBACK_RATE = 0.05
export const DEFAULT_UNLOCK_DAYS = 14

export type EntryType = "accrual_pending" | "unlock" | "cancel" | "redeem" | "adjust"

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

export function cashbackRate(): number {
  const raw = Number(process.env.CASHBACK_RATE)
  if (!Number.isFinite(raw) || raw < 0 || raw > 1) return DEFAULT_CASHBACK_RATE
  return raw
}

export function unlockDays(): number {
  const raw = Number(process.env.CASHBACK_UNLOCK_DAYS)
  if (!Number.isFinite(raw) || raw < 0) return DEFAULT_UNLOCK_DAYS
  return Math.round(raw)
}

/** 5% of net paid product amount. Gross is IVA-inclusive and must already exclude shipping and credit. */
export function accrualCents(productGrossInclVatCents: number, rate = cashbackRate()): number {
  return Math.max(0, Math.round(netFromGrossInclusive(productGrossInclVatCents) * rate))
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
  let pending = 0
  let available = 0
  let used = 0
  for (const entry of entries) {
    if (entry.type === "accrual_pending") {
      if (cancelled.has(entry.id)) continue
      if (unlocked.has(entry.id)) available += entry.amount_cents
      else pending += entry.amount_cents
    } else if (entry.type === "redeem") {
      used += entry.amount_cents
      available -= entry.amount_cents
    } else if (entry.type === "adjust") {
      available += entry.amount_cents
    }
  }
  return { pending, available, used }
}

export function accrualsReadyToUnlock(entries: LedgerEntry[], now: Date, days = unlockDays()): LedgerEntry[] {
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

export function creditExpiryDays(): number | null {
  const raw = process.env.CREDIT_EXPIRY_DAYS
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.round(parsed)
}
