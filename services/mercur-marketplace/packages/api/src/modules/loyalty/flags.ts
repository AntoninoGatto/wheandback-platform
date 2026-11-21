export type BenefitFlags = {
  referralEnabled: boolean
  promoEnabled: boolean
  redeemEnabled: boolean
  charityEnabled: boolean
  legalApproved: boolean
  trademarkLicenseSigned: boolean
  belowTierPolicy: "inactive"
  referralCapCents: number | null
  rewardUnlockEvent: string | null
  rewardUnlockDays: number | null
  creditExpiryMonths: number | null
}

function enabled(value: string | undefined): boolean {
  return value === "true"
}

function optionalInt(value: string | undefined): number | null {
  if (value == null || value.trim() === "") return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round(parsed)
}

/** Every new benefit is off unless the flag is the string "true". */
export function benefitFlags(env: NodeJS.ProcessEnv = process.env): BenefitFlags {
  return {
    referralEnabled: enabled(env.LOYALTY_REFERRAL_ENABLED),
    promoEnabled: enabled(env.PROMO_CODES_ENABLED),
    redeemEnabled: enabled(env.LOYALTY_REDEEM_ENABLED),
    charityEnabled: enabled(env.CHARITY_ENABLED),
    legalApproved: enabled(env.LEGAL_APPROVED),
    trademarkLicenseSigned: enabled(env.TRADEMARK_LICENSE_SIGNED),
    belowTierPolicy: "inactive",
    referralCapCents: optionalInt(env.REFERRAL_CAP_CENTS),
    rewardUnlockEvent: (env.REWARD_UNLOCK_EVENT || "").trim() || null,
    rewardUnlockDays: optionalInt(env.REWARD_UNLOCK_DAYS),
    creditExpiryMonths: optionalInt(env.CREDIT_EXPIRY_MONTHS),
  }
}
