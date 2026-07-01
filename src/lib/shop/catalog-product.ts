import type { ShopProduct } from "@/lib/supabase/queries";
import type { ShopCatalogProduct } from "@/types/shop";

export function toShopCatalogProduct(product: ShopProduct): ShopCatalogProduct {
  const isCj = product.supplier === "cj" || product.supplier_tier === "cj";

  return {
    ...product,
    source: isCj ? "cj" : "local",
  };
}
