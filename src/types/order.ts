export type OrderStatus =
  | "pending"
  | "payment_confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  cashback_percent: number;
  cashback_amount: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  cashback_total: number;
  referral_code_used: string | null;
  delivered_at: string | null;
  withdrawal_expires_at: string | null;
  cashback_credited_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
