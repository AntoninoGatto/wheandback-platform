export type ReservationDecision = "open" | "reserve-last" | "exhausted"

/** Only the last remaining use is held. It is released on expiry or payment failure. */
export function reservationDecision(input: {
  maxUses: number | null
  consumed: number
  reservedByOthers: number
}): ReservationDecision {
  if (input.maxUses == null) return "open"
  const remaining = input.maxUses - input.consumed - input.reservedByOthers
  if (remaining <= 0) return "exhausted"
  if (remaining === 1) return "reserve-last"
  return "open"
}

export function reservationExpiry(now: Date, minutes = 30): string {
  return new Date(now.getTime() + minutes * 60 * 1000).toISOString()
}
