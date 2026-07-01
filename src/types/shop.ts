export type ShopCatalogProduct = {
  id: string;
  slug: string | null;
  cj_product_id?: string | null;
  name: string;
  price: number;
  cashback_percent: number;
  category_id: string;
  images: string[];
  stock?: number;
  supplier?: string | null;
  supplier_tier?: "partner" | "premium" | "cj" | null;
  source: "local" | "cj";
  listed_num?: number | null;
  view_count?: number | null;
  sales_count?: number | null;
  created_at?: string | null;
};
