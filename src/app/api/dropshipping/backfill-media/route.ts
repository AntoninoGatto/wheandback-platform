import { NextResponse } from "next/server";
import {
  getProductDetail,
  getProductVariants,
  getProductComments,
  collectProductImages,
  buildStoredDescription,
} from "@/lib/dropshipping/cj";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Re-sync images, reviews and descriptions from CJ for products already in the DB. */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accesso negato" }, { status: 403 });

  const { data: products } = await adminSupabase
    .from("products")
    .select("id, cj_product_id, description")
    .eq("supplier", "cj")
    .not("cj_product_id", "is", null);

  if (!products?.length) {
    return NextResponse.json({ updated: 0, message: "Nessun prodotto CJ da aggiornare." });
  }

  let updated = 0;
  const errors: string[] = [];

  const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const product of products) {
    try {
      const cjProduct = await getProductDetail(product.cj_product_id!);
      if (!cjProduct) continue;

      let variants = cjProduct.variants ?? [];
      if (variants.length === 0) {
        variants = await getProductVariants(product.cj_product_id!);
      }

      const images = collectProductImages(cjProduct, variants);
      const reviews = await getProductComments(product.cj_product_id!, { pageSize: 20 });

      const updates: {
        images: string[];
        reviews: Awaited<ReturnType<typeof getProductComments>>;
        listed_num: number | null;
        weight_grams: number | null;
        description?: string;
      } = {
        images,
        reviews,
        listed_num: cjProduct.listedNum ?? null,
        weight_grams: cjProduct.productWeight > 0 ? Math.round(cjProduct.productWeight) : null,
      };

      if (!product.description?.trim() && cjProduct.description) {
        updates.description = buildStoredDescription(cjProduct.description);
      }

      const { error } = await adminSupabase.from("products").update(updates).eq("id", product.id);

      if (error) {
        errors.push(`${product.cj_product_id}: ${error.message}`);
      } else {
        updated++;
      }

      // CJ allows ~1 request/second — avoid rate-limit errors during bulk sync
      await pause(1200);
    } catch (err) {
      errors.push(`${product.cj_product_id}: ${String(err)}`);
    }
  }

  revalidatePath("/it/shop");
  revalidatePath("/en/shop");

  return NextResponse.json({
    updated,
    total: products.length,
    errors: errors.slice(0, 5),
  });
}
