export type SupplierTier = "partner" | "premium" | "cj";

export type TrendingProductRow = {
  supplier?: string | null;
  supplier_tier?: SupplierTier | null;
  sales_count?: number | null;
  view_count?: number | null;
  listed_num?: number | null;
  cashback_percent: number;
  created_at?: string | null;
};

/** Tier bonus: Partner > Premium > CJ (Phase 1 ranking). */
const TIER_BONUS: Record<SupplierTier, number> = {
  partner: 1000,
  premium: 500,
  cj: 0,
};

export function resolveSupplierTier(row: {
  supplier?: string | null;
  supplier_tier?: SupplierTier | null;
}): SupplierTier {
  if (row.supplier_tier === "partner" || row.supplier_tier === "premium" || row.supplier_tier === "cj") {
    return row.supplier_tier;
  }
  return row.supplier === "cj" ? "cj" : "partner";
}

/** Automatic trending score — higher is better. CJ excluded from homepage/shop default via query filter. */
export function computeTrendingScore(row: TrendingProductRow): number {
  const tier = resolveSupplierTier(row);
  const sales = (row.sales_count ?? 0) * 3;
  const views = (row.view_count ?? 0) * 0.1;
  const listed = Math.min(row.listed_num ?? 0, 200) * 0.5;
  const cashback = row.cashback_percent * 2;
  const recency =
    row.created_at != null
      ? Math.max(0, 30 - (Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  return TIER_BONUS[tier] + sales + views + listed + cashback + recency;
}

export function sortByTrendingScore<T extends TrendingProductRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => computeTrendingScore(b) - computeTrendingScore(a));
}

/** Search/catalog ranking: Partner > Premium > CJ, then trending within tier. */
export function compareCatalogRank(a: TrendingProductRow, b: TrendingProductRow): number {
  const tierOrder: Record<SupplierTier, number> = { partner: 0, premium: 1, cj: 2 };
  const tierDiff = tierOrder[resolveSupplierTier(a)] - tierOrder[resolveSupplierTier(b)];
  if (tierDiff !== 0) return tierDiff;
  return computeTrendingScore(b) - computeTrendingScore(a);
}
