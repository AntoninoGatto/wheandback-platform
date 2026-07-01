const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;
let tokenRequest: Promise<string> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestAccessToken(): Promise<string> {
  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) throw new Error("CJ_API_KEY non configurata in .env.local");

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });

    const data = await res.json();
    if (data.result) {
      const expiry = new Date(data.data.accessTokenExpiryDate).getTime();
      cachedToken = {
        token: data.data.accessToken,
        expiresAt: expiry - 60_000,
      };
      return cachedToken.token;
    }

    if (String(data.message ?? "").includes("Too Many Requests") && attempt < 2) {
      await sleep(1100 * (attempt + 1));
      continue;
    }

    throw new Error(`CJ Auth failed: ${data.message}`);
  }

  throw new Error("CJ Auth failed: Too Many Requests");
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  if (!tokenRequest) {
    tokenRequest = requestAccessToken().finally(() => {
      tokenRequest = null;
    });
  }

  return tokenRequest;
}

async function cjFetch(url: string, attempt = 0): Promise<Response> {
  const token = await getAccessToken();
  const res = await fetch(url, { headers: { "CJ-Access-Token": token } });

  if (res.status === 429 && attempt < 2) {
    await sleep(1100 * (attempt + 1));
    return cjFetch(url, attempt + 1);
  }

  return res;
}

export interface CJProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productImage: string;
  productWeight: number;
  sellPrice: number;
  categoryId: string;
  categoryName: string;
  variants: CJVariant[];
  description?: string;
  productImages?: string[];
  listedNum?: number;
}

export interface CJReview {
  commentId: string;
  comment: string;
  commentDate: string;
  commentUser: string;
  score: number;
  commentUrls: string[];
  countryCode?: string;
}

export interface CJVariant {
  vid: string;
  variantName: string;
  variantSellPrice: number;
  variantStock: number;
  variantImage?: string;
}

/** CJ API returns prices as strings — normalize to numbers. */
function parseCJPrice(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? 0));
  return Number.isFinite(n) ? n : 0;
}

function addImageUrl(urls: Set<string>, value: unknown) {
  if (typeof value === "string" && value.startsWith("http")) {
    urls.add(value);
  }
}

/** CJ uses productImageSet / bigImage — not productImages. */
export function extractProductImages(
  raw: Record<string, unknown>,
  variants: CJVariant[] = []
): string[] {
  const urls = new Set<string>();

  const imageSet = raw.productImageSet ?? raw.productImages;
  if (Array.isArray(imageSet)) {
    imageSet.forEach((url) => addImageUrl(urls, url));
  }

  addImageUrl(urls, raw.bigImage);
  addImageUrl(urls, raw.productImage);

  for (const variant of variants) {
    if (variant.variantImage) addImageUrl(urls, variant.variantImage);
  }

  return Array.from(urls);
}

function normalizeVariant(raw: Record<string, unknown>): CJVariant {
  return {
    vid: String(raw.vid ?? ""),
    variantName: String(raw.variantName ?? ""),
    variantSellPrice: parseCJPrice(raw.variantSellPrice),
    variantStock: typeof raw.variantStock === "number"
      ? raw.variantStock
      : parseInt(String(raw.variantStock ?? 0), 10) || 0,
    variantImage: raw.variantImage ? String(raw.variantImage) : undefined,
  };
}

function normalizeProduct(raw: Record<string, unknown>): CJProduct {
  const variants = Array.isArray(raw.variants)
    ? raw.variants.map((v) => normalizeVariant(v as Record<string, unknown>))
    : [];
  const images = extractProductImages(raw, variants);

  return {
    pid: String(raw.pid ?? ""),
    productName: String(raw.productName ?? ""),
    productNameEn: String(raw.productNameEn ?? ""),
    productImage: images[0] ?? String(raw.productImage ?? raw.bigImage ?? ""),
    productWeight: parseCJPrice(raw.productWeight),
    sellPrice: parseCJPrice(raw.sellPrice),
    categoryId: String(raw.categoryId ?? ""),
    categoryName: String(raw.categoryName ?? ""),
    variants,
    description: raw.description ? String(raw.description) : undefined,
    productImages: images.length > 0 ? images : undefined,
    listedNum: typeof raw.listedNum === "number"
      ? raw.listedNum
      : parseInt(String(raw.listedNum ?? 0), 10) || undefined,
  };
}

export interface CJSearchParams {
  productName?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  pageNum?: number;
  pageSize?: number;
  /** Filters variants to inventory in this warehouse country (e.g. IT for EU). */
  countryCode?: string;
}

export async function searchProducts(params: CJSearchParams): Promise<{ products: CJProduct[]; total: number }> {
  const query = new URLSearchParams({
    pageNum: String(params.pageNum ?? 1),
    pageSize: String(params.pageSize ?? 20),
    ...(params.productName && { productName: params.productName }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.minPrice !== undefined && { minPrice: String(params.minPrice) }),
    ...(params.maxPrice !== undefined && { maxPrice: String(params.maxPrice) }),
    ...(params.countryCode && { countryCode: params.countryCode }),
  });

  const res = await cjFetch(`${CJ_BASE}/product/list?${query}`);

  const data = await res.json();
  if (!data.result) return { products: [], total: 0 };

  const list = (data.data?.list ?? []) as Record<string, unknown>[];
  return {
    products: list.map(normalizeProduct),
    total: data.data?.total ?? 0,
  };
}

/** CJ returns HTML descriptions — convert to readable plain text. */
export function cleanCjDescription(html: string): string {
  let text = html
    .replace(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi, "$1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

/** Prefer readable text; keep CJ HTML when the description is mostly images. */
export function buildStoredDescription(cjHtml: string): string {
  const plain = cleanCjDescription(cjHtml);
  return plain.length >= 40 ? plain : cjHtml.trim();
}

export function isHtmlDescription(value: string): boolean {
  return /<[^>]+>/.test(value);
}

export function sanitizeProductHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export async function getProductDetail(
  pid: string,
  options?: { countryCode?: string }
): Promise<CJProduct | null> {
  const query = new URLSearchParams({
    pid,
    features: "enable_description",
    ...(options?.countryCode && { countryCode: options.countryCode }),
  });

  const res = await cjFetch(`${CJ_BASE}/product/query?${query}`);

  const data = await res.json();
  if (!data.result || !data.data) return null;
  return normalizeProduct(data.data as Record<string, unknown>);
}

export async function getProductVariants(pid: string): Promise<CJVariant[]> {
  const res = await cjFetch(`${CJ_BASE}/product/variant/query?pid=${pid}`);

  const data = await res.json();
  if (!data.result) return [];
  const list = (data.data ?? []) as Record<string, unknown>[];
  return list.map(normalizeVariant);
}

export async function getProductComments(
  pid: string,
  params?: { pageNum?: number; pageSize?: number }
): Promise<CJReview[]> {
  const query = new URLSearchParams({
    pid,
    pageNum: String(params?.pageNum ?? 1),
    pageSize: String(params?.pageSize ?? 10),
  });

  const res = await cjFetch(`${CJ_BASE}/product/productComments?${query}`);

  const data = await res.json();
  if (data.success !== true && data.result !== true) return [];

  const list = (data.data?.list ?? []) as Record<string, unknown>[];
  if (!Array.isArray(list)) return [];

  return list.map((raw) => ({
    commentId: String(raw.commentId ?? ""),
    comment: String(raw.comment ?? ""),
    commentDate: String(raw.commentDate ?? ""),
    commentUser: String(raw.commentUser ?? "Cliente"),
    score: parseInt(String(raw.score ?? 5), 10) || 5,
    commentUrls: Array.isArray(raw.commentUrls) ? raw.commentUrls.map(String) : [],
    countryCode: raw.countryCode ? String(raw.countryCode) : undefined,
  }));
}

/** Build image list from normalized CJ product + optional extra variants. */
export function collectProductImages(
  cjProduct: CJProduct,
  extraVariants: CJVariant[] = []
): string[] {
  const urls = new Set<string>();
  for (const url of cjProduct.productImages ?? []) addImageUrl(urls, url);
  addImageUrl(urls, cjProduct.productImage);
  for (const variant of [...(cjProduct.variants ?? []), ...extraVariants]) {
    if (variant.variantImage) addImageUrl(urls, variant.variantImage);
  }
  return Array.from(urls);
}

/**
 * Calculate sell price to respect the 50% margin rule.
 * sell_price = purchase_price / 0.50 + small buffer
 */
export function calculateSellPrice(purchasePrice: number): number {
  const minSellPrice = purchasePrice / 0.5;
  // Round up to nearest .99
  return Math.ceil(minSellPrice) - 0.01;
}

/**
 * Calculate cashback percent based on margin.
 * We give 35% of the sell price as max cashback.
 * Default: use 20% as a balanced starting point.
 */
export function calculateCashbackPercent(purchasePrice: number, sellPrice: number): number {
  const marginPercent = ((sellPrice - purchasePrice) / sellPrice) * 100;
  // Use 60% of the available margin as cashback, capped at 35%
  return Math.min(35, Math.round(marginPercent * 0.6 * 10) / 10);
}
