export type CampaignStatus = "draft" | "approved" | "expired"

export type CampaignWindow = {
  id: string
  public_code: string
  status: CampaignStatus
  starts_at: string
  ends_at: string
  lines: { variant_id: string; discount_bps: number }[]
}

export function assertDiscountBps(bps: number): void {
  if (!Number.isInteger(bps) || bps < 300 || bps > 1300) {
    throw new Error("Lo sconto deve essere tra 3% e 13%")
  }
}

export function windowsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd)
}

function sameCode(a: string, b: string): boolean {
  return a.trim().toUpperCase() === b.trim().toUpperCase()
}

/**
 * Personal codes and promo codes are different namespaces.
 * The same promo code cannot cover the same variant in two overlapping approved windows.
 */
export function campaignOverlapError(
  existing: CampaignWindow[],
  candidate: CampaignWindow,
  personalCodes: string[]
): string | null {
  if (personalCodes.some((code) => sameCode(code, candidate.public_code))) {
    return "Codice personale e codice promo sono namespace separati"
  }
  if (candidate.status !== "approved") return null
  for (const line of candidate.lines) assertDiscountBps(line.discount_bps)
  for (const other of existing) {
    if (other.id === candidate.id || other.status !== "approved") continue
    if (!windowsOverlap(candidate.starts_at, candidate.ends_at, other.starts_at, other.ends_at)) continue
    if (!sameCode(other.public_code, candidate.public_code)) continue
    const variants = new Set(other.lines.map((line) => line.variant_id))
    if (candidate.lines.some((line) => variants.has(line.variant_id))) {
      return "Sovrapposizione dello stesso codice sulla stessa variante"
    }
  }
  return null
}

/** Civil midnight in `timeZone` for YYYY-MM-DD, as an ISO UTC string. */
export function zonedMidnightUtc(isoDate: string, timeZone = "Europe/Rome"): string {
  const [year, month, day] = isoDate.split("-").map(Number)
  let utc = Date.UTC(year, month - 1, day, 0, 0, 0)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = formatter.formatToParts(new Date(utc))
    const read = (type: string) => Number(parts.find((part) => part.type === type)?.value)
    const shown = Date.UTC(read("year"), read("month") - 1, read("day"), read("hour"), read("minute"), read("second"))
    const target = Date.UTC(year, month - 1, day, 0, 0, 0)
    const delta = target - shown
    if (delta === 0) break
    utc += delta
  }
  return new Date(utc).toISOString()
}

/** «Fino al 30/11 incluso» → exclusive end at 2026-12-01 00:00 Europe/Rome. */
export function inclusiveCalendarEndUtc(lastInclusiveDay: string, timeZone = "Europe/Rome"): string {
  const [year, month, day] = lastInclusiveDay.split("-").map(Number)
  const next = new Date(Date.UTC(year, month - 1, day))
  next.setUTCDate(next.getUTCDate() + 1)
  const nextDay = next.toISOString().slice(0, 10)
  return zonedMidnightUtc(nextDay, timeZone)
}

export function nextCampaignStatus(
  status: string,
  endsAt: string,
  now: string
): CampaignStatus | null {
  if (status === "approved" && Date.parse(now) >= Date.parse(endsAt)) return "expired"
  return null
}
