import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/dropshipping/cj";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  CJ_EU_WAREHOUSE_COUNTRY,
  inferCategoryId,
  passesCatalogRules,
  toCatalogPreview,
} from "@/lib/dropshipping/catalog-rules";
import type { Database } from "@/types/database.types";
import type { CategoryId } from "@/constants/categories";
import type { ShopCatalogProduct } from "@/types/shop";
import {
  buildLocalSearchTerms,
  translateSearchQueryForCj,
} from "@/lib/search/translate-query";
import type { Locale } from "@/lib/i18n/routing";
import { compareCatalogRank } from "@/lib/shop/trending";

function getAdminSupabase() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function matchesCategory(categoryId: string, selected: string) {
  return selected === "all" || categoryId === selected;
}

const LOCAL_SELECT =
  "id, name, price, cashback_percent, category_id, images, slug, stock, cj_product_id, supplier, supplier_tier, listed_num, view_count, sales_count, created_at";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = (searchParams.get("q") ?? "").trim();
  const category = searchParams.get("category") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "cashback_desc";
  const locale = (searchParams.get("locale") ?? "it") as Locale;

  const adminSupabase = getAdminSupabase();

  let englishQuery = query;
  let translated = false;

  if (query.length >= 2) {
    const translation = await translateSearchQueryForCj(query, locale);
    englishQuery = translation.englishQuery;
    translated = translation.translated;
  }

  const localSearchTerms = query.length >= 2 ? buildLocalSearchTerms(query, englishQuery) : [];

  let dbQuery = adminSupabase
    .from("products")
    .select(LOCAL_SELECT)
    .eq("status", "published")
    .eq("is_blacklisted", false)
    .gt("stock", 0);

  if (category !== "all") {
    dbQuery = dbQuery.eq("category_id", category);
  }

  const fetchLimit = localSearchTerms.length > 0 ? 200 : 60;
  const { data: localRows, error } = await dbQuery.limit(fetchLimit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filteredLocalRows =
    localSearchTerms.length > 0
      ? (localRows ?? []).filter((row) =>
          localSearchTerms.some((term) =>
            row.name.toLowerCase().includes(term.toLowerCase())
          )
        )
      : (localRows ?? []);

  const localProducts: ShopCatalogProduct[] = filteredLocalRows.slice(0, 60).map((row) => ({
    id: row.id,
    slug: row.slug,
    cj_product_id: row.cj_product_id,
    name: row.name,
    price: row.price,
    cashback_percent: row.cashback_percent,
    category_id: row.category_id,
    images: row.images ?? [],
    stock: row.stock,
    supplier: row.supplier,
    supplier_tier: row.supplier_tier,
    source: row.supplier === "cj" ? "cj" : "local",
  }));

  const knownCjIds = new Set(
    localProducts.map((p) => p.cj_product_id).filter(Boolean) as string[]
  );

  let cjProducts: ShopCatalogProduct[] = [];

  if (query.length >= 2) {
    try {
      const result = await searchProducts({
        productName: englishQuery,
        pageSize: 30,
        countryCode: CJ_EU_WAREHOUSE_COUNTRY,
      });
      const filtered = result.products.filter((product) => {
        if (!passesCatalogRules(product)) return false;
        const categoryId = inferCategoryId(product);
        return matchesCategory(categoryId, category);
      });

      cjProducts = filtered
        .filter((product) => !knownCjIds.has(product.pid))
        .map((product) => {
          const preview = toCatalogPreview(
            product,
            category !== "all" ? (category as CategoryId) : undefined
          );
          return {
            id: `cj-${product.pid}`,
            slug: null,
            cj_product_id: product.pid,
            name: preview.name,
            price: preview.price,
            cashback_percent: preview.cashback_percent,
            category_id: preview.category_id,
            images: preview.images,
            supplier: "cj",
            supplier_tier: "cj" as const,
            source: "cj" as const,
          };
        });
    } catch (err) {
      return NextResponse.json({
        products: localProducts,
        cjError: String(err),
      });
    }
  }

  const merged = [...localProducts, ...cjProducts];

  if (sortBy === "price_asc") {
    merged.sort((a, b) => {
      const priceDiff = a.price - b.price;
      return priceDiff !== 0 ? priceDiff : compareCatalogRank(a, b);
    });
  } else if (sortBy === "price_desc") {
    merged.sort((a, b) => {
      const priceDiff = b.price - a.price;
      return priceDiff !== 0 ? priceDiff : compareCatalogRank(a, b);
    });
  } else if (sortBy === "cashback_desc") {
    merged.sort((a, b) => {
      const cashbackDiff = b.cashback_percent - a.cashback_percent;
      return cashbackDiff !== 0 ? cashbackDiff : compareCatalogRank(a, b);
    });
  } else {
    merged.sort(compareCatalogRank);
  }

  return NextResponse.json({
    products: merged,
    total: merged.length,
    translatedQuery: translated ? englishQuery : null,
  });
}
