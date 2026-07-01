export type CashbackStatus = "pending" | "credited" | "used" | "expired" | "cancelled";

export type CashbackSource = "purchase" | "referral" | "bonus";

export interface CashbackTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  source: CashbackSource;
  amount: number;
  status: CashbackStatus;
  /**
   * Cashback is NEVER withdrawable as cash.
   * It is internal credit only, usable for new purchases on the platform.
   */
  is_withdrawable: false;
  credited_at: string | null;
  expires_at: string | null;
  created_at: string;
}
