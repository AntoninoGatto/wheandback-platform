import {
  buildStoredDescription,
  getProductComments,
  getProductDetail,
  isHtmlDescription,
  sanitizeProductHtml,
  type CJReview,
} from "@/lib/dropshipping/cj";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { ProductDetail } from "@/lib/supabase/queries";

export function parseProductReviews(raw: unknown): CJReview[] {
  if (!raw) return [];
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? (value as CJReview[]) : [];
}

/** Fetch missing CJ description/reviews once and persist them for product pages. */
export async function enrichCJProductIfNeeded(
  product: ProductDetail & { cj_product_id: string | null }
): Promise<ProductDetail> {
  const existingReviews = parseProductReviews(product.reviews);
  const needsDesc = !product.description?.trim();
  const needsReviews = existingReviews.length === 0;

  if (!product.cj_product_id || (!needsDesc && !needsReviews)) {
    return { ...product, reviews: existingReviews };
  }

  try {
    let cjProduct = null;
    if (needsDesc) {
      cjProduct = await getProductDetail(product.cj_product_id);
    }

    let cjReviews: CJReview[] = [];
    if (needsReviews) {
      cjReviews = await getProductComments(product.cj_product_id, { pageSize: 20 });
    }

    const description =
      needsDesc && cjProduct?.description
        ? buildStoredDescription(cjProduct.description)
        : product.description;

    const reviews =
      needsReviews && cjReviews.length > 0 ? cjReviews : existingReviews;

    const updates: { description?: string; reviews?: CJReview[] } = {};
    if (needsDesc && description?.trim()) updates.description = description;
    if (needsReviews && reviews.length > 0) updates.reviews = reviews;

    if (Object.keys(updates).length > 0) {
      const admin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { error } = await admin.from("products").update(updates).eq("id", product.id);
      if (error) console.error("enrichCJProductIfNeeded:", error.message);
    }

    return { ...product, description: description ?? product.description, reviews };
  } catch (err) {
    console.error("enrichCJProductIfNeeded:", err);
    return { ...product, reviews: existingReviews };
  }
}
