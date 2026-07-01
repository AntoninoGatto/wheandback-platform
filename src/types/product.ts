import type { CategoryId } from "@/constants/categories";

export type ProductStatus = "draft" | "pending_approval" | "published" | "rejected" | "blacklisted";

export interface Product {
  id: string;
  seller_id: string;
  category_id: CategoryId;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  cashback_percent: number;
  margin_percent: number;
  status: ProductStatus;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductTranslation {
  product_id: string;
  locale: string;
  name: string;
  description: string;
}
