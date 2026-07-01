import { createClient } from "@/lib/supabase/server";
import { sortByTrendingScore, type SupplierTier } from "@/lib/shop/trending";

const QUERY_TIMEOUT_MS = 8000;

export type ShopProduct = {
  id: string;
  name: string;
  price: number;
  cashback_percent: number;
  category_id: string;
  images: string[];
  slug: string;
  stock?: number;
  supplier?: string | null;
  supplier_tier?: SupplierTier | null;
  listed_num?: number | null;
  view_count?: number | null;
  sales_count?: number | null;
  created_at?: string | null;
};

const SHOP_PRODUCT_SELECT =
  "id, name, price, cashback_percent, category_id, images, slug, stock, supplier, supplier_tier, listed_num, view_count, sales_count, created_at";

const SHOP_PRODUCT_SELECT_FALLBACK =
  "id, name, price, cashback_percent, category_id, images, slug, stock, supplier, created_at";

async function fetchPublishedProductRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  options: { limit: number; partnerOnly?: boolean }
): Promise<ShopProduct[]> {
  const buildQuery = (select: string) => {
    let query = supabase
      .from("products")
      .select(select)
      .eq("status", "published")
      .eq("is_blacklisted", false)
      .gt("stock", 0)
      .limit(options.limit);

    if (options.partnerOnly) {
      query = query.neq("supplier", "cj");
    }

    return query;
  };

  let { data, error } = await withTimeout(buildQuery(SHOP_PRODUCT_SELECT));

  if (error) {
    console.warn("fetchPublishedProductRows fallback:", error.message);
    ({ data, error } = await withTimeout(buildQuery(SHOP_PRODUCT_SELECT_FALLBACK)));
  }

  if (error) {
    console.error("fetchPublishedProductRows:", error.message);
    return [];
  }

  return (data ?? []) as ShopProduct[];
}

export async function withTimeout<T>(promise: PromiseLike<T>, ms = QUERY_TIMEOUT_MS): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Supabase query timeout")), ms);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/** Fetch published products without blocking the page if Supabase is slow/unreachable. */
export async function fetchPublishedProducts(options?: {
  limit?: number;
  sortBy?: "created_at" | "cashback_percent";
}): Promise<ShopProduct[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select(SHOP_PRODUCT_SELECT)
      .eq("status", "published")
      .eq("is_blacklisted", false)
      .gt("stock", 0);

    if (options?.sortBy === "cashback_percent") {
      query = query.order("cashback_percent", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await withTimeout(query);

    if (error) {
      console.error("fetchPublishedProducts:", error.message);
      return [];
    }

    return (data ?? []) as ShopProduct[];
  } catch (err) {
    console.error("fetchPublishedProducts:", err);
    return [];
  }
}

/** Published catalog for shop — all tiers, partner/premium ranked above CJ. */
export async function fetchShopCatalogProducts(options?: { limit?: number }): Promise<ShopProduct[]> {
  try {
    const supabase = await createClient();
    const rows = await fetchPublishedProductRows(supabase, {
      limit: options?.limit ?? 120,
    });
    return sortByTrendingScore(rows).slice(0, options?.limit ?? rows.length);
  } catch (err) {
    console.error("fetchShopCatalogProducts:", err);
    return [];
  }
}

async function fetchPartnerCatalogProducts(limit: number): Promise<ShopProduct[]> {
  try {
    const supabase = await createClient();
    const rows = await fetchPublishedProductRows(supabase, {
      limit,
      partnerOnly: true,
    });
    return sortByTrendingScore(
      rows.filter((row) => (row.supplier_tier ?? "partner") !== "cj")
    ).slice(0, limit);
  } catch (err) {
    console.error("fetchPartnerCatalogProducts:", err);
    return [];
  }
}

/** Homepage trending: partner/premium first; falls back to full catalog if none yet. */
export async function fetchTrendingProducts(limit = 8): Promise<ShopProduct[]> {
  const partnerProducts = await fetchPartnerCatalogProducts(limit);
  if (partnerProducts.length > 0) return partnerProducts;
  return fetchShopCatalogProducts({ limit });
}

export type ProductDetail = ShopProduct & {
  description: string | null;
  seller_id: string | null;
  cj_product_id: string | null;
  reviews: unknown;
  listed_num: number | null;
  weight_grams: number | null;
};

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await withTimeout(
      supabase
        .from("products")
        .select(
          "id, name, description, price, cashback_percent, stock, images, slug, category_id, seller_id, cj_product_id, reviews, listed_num, weight_grams"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .eq("is_blacklisted", false)
        .single()
    );

    if (error || !data) return null;

    const { enrichCJProductIfNeeded } = await import("@/lib/dropshipping/enrich-product");
    return enrichCJProductIfNeeded(data as ProductDetail);
  } catch (err) {
    console.error("fetchProductBySlug:", err);
    return null;
  }
}

export async function fetchRelatedProducts(
  categoryId: string,
  excludeId: string
): Promise<ShopProduct[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await withTimeout(
      supabase
        .from("products")
        .select("id, name, price, cashback_percent, category_id, images, slug")
        .eq("status", "published")
        .eq("is_blacklisted", false)
        .eq("category_id", categoryId)
        .neq("id", excludeId)
        .gt("stock", 0)
        .limit(4)
    );

    if (error) return [];
    return (data ?? []) as ShopProduct[];
  } catch (err) {
    console.error("fetchRelatedProducts:", err);
    return [];
  }
}
