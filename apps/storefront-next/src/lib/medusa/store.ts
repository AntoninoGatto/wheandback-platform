import { medusaFetch } from "./http";

export type StoreProduct = {
  id: string;
  title: string;
  handle?: string | null;
  thumbnail?: string | null;
  description?: string | null;
};

export type StoreListProductsResponse = {
  products: StoreProduct[];
  count: number;
  offset: number;
  limit: number;
};

export async function listProducts(params?: { limit?: number; offset?: number; q?: string }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();

  return medusaFetch<StoreListProductsResponse>(`/store/products${query ? `?${query}` : ""}`);
}

export type StoreRetrieveProductResponse = {
  product: StoreProduct;
};

export async function getProduct(productId: string) {
  return medusaFetch<StoreRetrieveProductResponse>(
    `/store/products/${encodeURIComponent(productId)}`
  );
}

export type StoreCreateCartResponse = {
  cart: { id: string };
};

export async function createCart() {
  return medusaFetch<StoreCreateCartResponse>("/store/carts", { method: "POST" });
}

export async function addLineItem(cartId: string, variantId: string, quantity: number) {
  return medusaFetch(`/store/carts/${encodeURIComponent(cartId)}/line-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ variant_id: variantId, quantity }),
  });
}
