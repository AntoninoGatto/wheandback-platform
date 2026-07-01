export interface ReferralLink {
  id: string;
  user_id: string;
  code: string;
  url: string;
  total_invited: number;
  total_earned: number;
  created_at: string;
}

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  order_id: string;
  level: number;
  reward_amount: number;
  credited_at: string | null;
  created_at: string;
}

/**
 * Future integration: Whe&Back Coin token.
 * This type is a placeholder for the tokenization feature
 * planned for later stages of the project.
 */
export interface WhebackCoin {
  user_id: string;
  balance: number;
  total_earned: number;
  last_updated: string;
}
