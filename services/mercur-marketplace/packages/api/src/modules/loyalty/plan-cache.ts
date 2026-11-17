type Cached = { version: number; body: unknown }
let cached: Cached | null = null
let version = 0

export function readPlanCache(): Cached | null {
  return cached
}

export function writePlanCache(body: unknown): void {
  cached = { version, body }
}

export function invalidatePlanCache(): number {
  version += 1
  cached = null
  return version
}
