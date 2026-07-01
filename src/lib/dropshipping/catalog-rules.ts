import { BLACKLISTED_KEYWORDS, ALLOWED_CATEGORIES, type CategoryId } from "@/constants/categories";
import {
  calculateSellPrice,
  calculateCashbackPercent,
  type CJProduct,
} from "@/lib/dropshipping/cj";

/** Minimum customer-facing sell price for CJ catalog (EUR). */
export const MIN_CJ_SELL_PRICE_EUR = 3;

/** Minimum CJ catalog popularity (listedNum on CJ). */
export const MIN_CJ_LISTED_NUM = 10;

/** Primary EU warehouse country for CJ stock filter (Italy). */
export const CJ_EU_WAREHOUSE_COUNTRY = "IT";

export function isBlacklistedProductName(name: string): boolean {
  const nameLower = name.toLowerCase();
  return BLACKLISTED_KEYWORDS.some((kw) => nameLower.includes(kw));
}

export function passesMarginRules(purchasePrice: number): boolean {
  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) return false;
  const sellPrice = calculateSellPrice(purchasePrice);
  const marginPercent = ((sellPrice - purchasePrice) / sellPrice) * 100;
  return marginPercent >= 50;
}

export function passesMinSellPrice(purchasePrice: number): boolean {
  return calculateSellPrice(purchasePrice) >= MIN_CJ_SELL_PRICE_EUR;
}

export function passesPopularityRules(product: CJProduct): boolean {
  return (product.listedNum ?? 0) >= MIN_CJ_LISTED_NUM;
}

/** True when CJ variants show stock in the requested warehouse (after countryCode filter). */
export function hasEuWarehouseStock(product: CJProduct): boolean {
  const variants = product.variants ?? [];
  if (variants.length === 0) return true;
  return variants.some((v) => v.variantStock > 0);
}

/** Same rules applied on admin import and customer-facing CJ catalog. */
export function passesCatalogRules(product: CJProduct): boolean {
  const name = product.productNameEn || product.productName || "";
  if (isBlacklistedProductName(name)) return false;
  if (!passesMinSellPrice(product.sellPrice)) return false;
  if (!passesPopularityRules(product)) return false;
  if (!hasEuWarehouseStock(product)) return false;
  return passesMarginRules(product.sellPrice);
}

const CATEGORY_HINTS: Record<CategoryId, string[]> = {
  "largo-consumo": ["consumer", "general", "daily", "largo"],
  oggettistica: ["gift", "souvenir", "decor", "oggett"],
  "cani-gatti": ["pet", "dog", "cat", "animal"],
  "elettrica-elettronica": ["electronic", "electric", "phone", "tablet", "computer", "usb", "cable"],
  casa: ["home", "garden", "furniture", "kitchen", "bedroom", "house"],
  hobby: ["hobby", "craft", "art", "creative"],
  giocattoli: ["toy", "baby", "kid", "children"],
  "salute-benessere": ["health", "beauty", "wellness", "fitness", "massage"],
  sport: ["sport", "outdoor", "camping", "fitness", "gym"],
  ufficio: ["office", "stationery", "school", "pen"],
};

export function inferCategoryId(product: CJProduct): CategoryId {
  const haystack = `${product.categoryName} ${product.productNameEn} ${product.productName}`.toLowerCase();

  for (const category of ALLOWED_CATEGORIES) {
    const hints = CATEGORY_HINTS[category.id];
    if (hints.some((hint) => haystack.includes(hint))) {
      return category.id;
    }
  }

  return "largo-consumo";
}

export function toCatalogPreview(product: CJProduct, categoryId?: CategoryId) {
  const purchasePrice = product.sellPrice;
  const price = calculateSellPrice(purchasePrice);
  const cashback_percent = calculateCashbackPercent(purchasePrice, price);
  const category_id = categoryId ?? inferCategoryId(product);

  return {
    cj_product_id: product.pid,
    name: product.productNameEn || product.productName,
    price,
    cashback_percent,
    category_id,
    images: product.productImage ? [product.productImage] : [],
    source: "cj" as const,
  };
}
