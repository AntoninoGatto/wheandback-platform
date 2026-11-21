import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "@/lib/medusa/config";

export type LoyaltyPlan = {
  source: string;
  cashback_rate: number;
  unlock_days: number | null;
  headline: string;
  badge: string;
  benefit?: null;
  referral_tiers?: { A: number; B: number; C: number } | null;
};

const noBenefit: LoyaltyPlan = {
  source: "none",
  cashback_rate: 0,
  unlock_days: null,
  headline: "",
  badge: "",
  benefit: null,
  referral_tiers: null,
};

export async function getLoyaltyPlan(): Promise<LoyaltyPlan> {
  if (!MEDUSA_PUBLISHABLE_KEY) return noBenefit;
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/loyalty/plan`, {
      headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
      next: { revalidate: 60, tags: ["loyalty-plan"] },
    });
    if (!response.ok) return noBenefit;
    const plan = (await response.json()) as LoyaltyPlan;
    if ((plan.headline || "").includes("105")) plan.headline = "";
    if ((plan.badge || "").includes("105")) plan.badge = "";
    return plan;
  } catch {
    return noBenefit;
  }
}
