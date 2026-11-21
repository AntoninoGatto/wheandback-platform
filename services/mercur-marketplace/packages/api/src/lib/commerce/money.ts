export type MoneyUnit = "cents" | "major"

/**
 * Convert a stored amount into integer cents.
 * The unit is explicit: a 1200 € order passed as major units is 120000 cents.
 * The previous `value > 1000` guess treated that order as 12 €.
 */
export function toCents(value: number | null | undefined, unit: MoneyUnit): number {
  if (value == null || !Number.isFinite(value)) return 0
  if (unit === "cents") return Math.round(value)
  return Math.round(value * 100)
}

export function moneyUnit(env: NodeJS.ProcessEnv = process.env): MoneyUnit {
  return env.MONEY_UNIT === "cents" ? "cents" : "major"
}
