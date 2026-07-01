export type UserRole = "customer" | "seller" | "admin";

export type UserStatus = "active" | "suspended" | "pending_approval";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name: string | null;
  referral_code: string;
  referred_by: string | null;
  cashback_balance: number;
  cashback_pending: number;
  date_of_birth: string | null;
  is_minor: boolean;
  privacy_accepted_at: string | null;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  company_name: string;
  vat_number: string | null;
  terms_accepted_at: string;
  approved_at: string | null;
  approved_by: string | null;
  is_active: boolean;
  created_at: string;
}
