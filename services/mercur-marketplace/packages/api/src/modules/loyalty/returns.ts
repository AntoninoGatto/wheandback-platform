export type ReturnSlice = {
  price_cents: number
  reward_cents: number
  internal_cents: number
}

/**
 * Split a line across partial returns. The parts' prices must sum to the price paid,
 * and the reversed quotas sum to the original reward and internal cents.
 */
export function allocateReturns(input: {
  pricePaidCents: number
  rewardCents: number
  internalCents: number
  priceParts: number[]
}): ReturnSlice[] {
  const sum = input.priceParts.reduce((total, part) => total + part, 0)
  if (sum !== input.pricePaidCents) {
    throw new Error("La somma dei resi deve coincidere con i centesimi della riga")
  }
  return input.priceParts.map((price, index) => ({
    price_cents: price,
    reward_cents: allocateShare(input.rewardCents, input.priceParts, index),
    internal_cents: allocateShare(input.internalCents, input.priceParts, index),
  }))
}

function allocateShare(total: number, weights: number[], index: number): number {
  if (total === 0) return 0
  const sum = weights.reduce((acc, weight) => acc + weight, 0)
  if (sum === 0) return 0
  const floors = weights.map((weight) => Math.floor((total * weight) / sum))
  let leftover = total - floors.reduce((acc, value) => acc + value, 0)
  const order = weights
    .map((weight, position) => ({
      position,
      remainder: (total * weight) % sum,
    }))
    .sort((a, b) => b.remainder - a.remainder || a.position - b.position)
  for (const item of order) {
    if (leftover <= 0) break
    floors[item.position] += 1
    leftover -= 1
  }
  return floors[index]
}
