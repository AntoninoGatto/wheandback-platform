/**
 * Supplier discount → referrer tier, in basis points.
 * 50% → 35%, 42% → 27%, 36% → 21%, otherwise no benefit.
 * The input is already an integer basis point. Do not round it before this check.
 */
export function tierFor(supplierDiscountBps: number): number | null {
  if (!Number.isInteger(supplierDiscountBps)) return null
  if (supplierDiscountBps >= 5000) return 3500
  if (supplierDiscountBps >= 4200) return 2700
  if (supplierDiscountBps >= 3600) return 2100
  return null
}

/** Integer discount bps. Truncates toward zero so 35.995% stays below the 36% tier. */
export function supplierDiscountBps(referenceCents: number, costCents: number): number | null {
  if (!Number.isInteger(referenceCents) || !Number.isInteger(costCents)) return null
  if (referenceCents <= 0 || costCents < 0 || costCents > referenceCents) return null
  return Math.floor(((referenceCents - costCents) * 10000) / referenceCents)
}

/** Per-line rounding: round(base × qty × tier / 10000), once, in integer cents. */
export function lineRewardCents(
  rewardBaseCents: number,
  qty: number,
  tierBps: number | null
): number {
  if (tierBps == null || tierBps <= 0 || rewardBaseCents <= 0 || qty <= 0) return 0
  return Math.round((rewardBaseCents * qty * tierBps) / 10000)
}

export function discountCents(initialPriceCents: number, discountBps: number): number {
  if (initialPriceCents <= 0 || discountBps <= 0) return 0
  return Math.round((initialPriceCents * discountBps) / 10000)
}
