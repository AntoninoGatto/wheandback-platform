import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "@/lib/medusa/config";

export type LoyaltyPlan = {
  source: string;
  cashback_rate: number;
  unlock_days: number;
  headline: string;
  badge: string;
  referral_tiers?: { A: number; B: number; C: number };
  referral_orders?: number;
};

const fallback: LoyaltyPlan = {
  source: "builtin",
  cashback_rate: 0.05,
  unlock_days: 14,
  headline: "fino al 105% in credito WheBack",
  badge: "fino al 5% in credito WheBack",
};

export async function getLoyaltyPlan(): Promise<LoyaltyPlan> {
  if (!MEDUSA_PUBLISHABLE_KEY) return fallback;
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/loyalty/plan`, {
      headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
      next: { revalidate: 60, tags: ["loyalty-plan"] },
    });
    if (!response.ok) return fallback;
    return (await response.json()) as LoyaltyPlan;
  } catch {
    return fallback;
  }
}
