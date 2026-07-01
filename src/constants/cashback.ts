export const CASHBACK = {
  MIN_PERCENT: 5,
  MAX_PERCENT: 35,

  /**
   * The seller's purchase price must be AT MOST 50% of the sale price.
   * This ensures enough margin to cover: 35% referral + 1% charity + ~14% profit.
   * Example: sale price €10 → max purchase price €5.
   */
  MIN_MARGIN_PERCENT: 50,

  /**
   * Distribution of the 50% margin:
   * - 35% → referral rewards for customers
   * - 1%  → monthly charity donation
   * - ~14% → commercial margin / company profit
   */
  REFERRAL_SHARE_PERCENT: 35,
  CHARITY_SHARE_PERCENT: 1,

  /**
   * Cashback is only credited after delivery AND expiry of withdrawal right.
   * Italian law: 14 days withdrawal period (D.Lgs. 206/2005).
   */
  WITHDRAWAL_DAYS: 14,

  /**
   * Cashback is INTERNAL CREDIT ONLY.
   * It can NEVER be withdrawn as cash.
   * Funds remain in Buy All Free LTD bank account at all times.
   */
  IS_WITHDRAWABLE: false,

  /**
   * The buyer CANNOT use their own referral code.
   * If no referrer is present, the platform default referral is applied.
   */
  SELF_REFERRAL_FORBIDDEN: true,

  /**
   * Platform default referral code — applied when a buyer has no referrer.
   */
  PLATFORM_REFERRAL_CODE: "WHEBACK-PLATFORM",
} as const;

export const ROYALTY = {
  PERCENT_OF_REVENUE: 0.003,
  FIXED_ANNUAL_FEE: 12000,
  MINIMUM_ANNUAL_GUARANTEED: 12000,
  TOTAL_MINIMUM_ANNUAL: 24000,
  CALCULATION_FREQUENCY_MONTHS: 3,
} as const;

export const CHARITY = {
  PERCENT_OF_REVENUE: 0.01,
  FREQUENCY: "monthly",
  BENEFICIARY: "Il Segreto di Aladino",
} as const;

/**
 * Dropshipping supplier requirements:
 * - Max shipping days: 5
 * - Products must be loadable automatically via API/feed
 */
export const DROPSHIPPING = {
  MAX_SHIPPING_DAYS: 5,
} as const;
