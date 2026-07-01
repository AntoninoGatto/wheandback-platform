import {
  getProductDetail,
  getProductVariants,
  getProductComments,
  collectProductImages,
  calculateSellPrice,
  calculateCashbackPercent,
  buildStoredDescription,
} from "@/lib/dropshipping/cj";
import { generateProductDescription } from "@/lib/ai/descriptions";
import {
  inferCategoryId,
  isBlacklistedProductName,
  passesCatalogRules,
  CJ_EU_WAREHOUSE_COUNTRY,
} from "@/lib/dropshipping/catalog-rules";
import type { CategoryId } from "@/constants/categories";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ImportCjProductResult =
  | {
      success: true;
      productId: string;
      slug: string;
      name: string;
      sellPrice: number;
      cashbackPercent: number;
      alreadyExisted: boolean;
    }
  | { success: false; error: string };

function getAdminSupabase() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getDefaultSellerId(adminSupabase: ReturnType<typeof getAdminSupabase>) {
  const { data } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function findProductByCjId(cjProductId: string) {
  const adminSupabase = getAdminSupabase();
  const { data } = await adminSupabase
    .from("products")
    .select("id, slug, status, is_blacklisted")
    .eq("cj_product_id", cjProductId)
    .maybeSingle();

  return data;
}

export async function importCjProduct(options: {
  cjProductId: string;
  categoryId?: CategoryId;
  sellerId?: string;
  importedByUserId?: string;
  skipAi?: boolean;
}): Promise<ImportCjProductResult> {
  const adminSupabase = getAdminSupabase();

  const existing = await findProductByCjId(options.cjProductId);
  if (existing?.slug && existing.status === "published" && !existing.is_blacklisted) {
    const { data: full } = await adminSupabase
      .from("products")
      .select("id, slug, name, price, cashback_percent")
      .eq("id", existing.id)
      .single();

    return {
      success: true,
      productId: full!.id,
      slug: full!.slug,
      name: full!.name,
      sellPrice: full!.price,
      cashbackPercent: full!.cashback_percent,
      alreadyExisted: true,
    };
  }

  const cjProduct = await getProductDetail(options.cjProductId, {
    countryCode: CJ_EU_WAREHOUSE_COUNTRY,
  });
  if (!cjProduct) {
    return { success: false, error: "Prodotto non trovato su CJ Dropshipping" };
  }

  const purchasePrice = cjProduct.sellPrice;
  const sellPrice = calculateSellPrice(purchasePrice);
  const cashbackPercent = calculateCashbackPercent(purchasePrice, sellPrice);
  const categoryId = options.categoryId ?? inferCategoryId(cjProduct);

  const nameLower = (cjProduct.productNameEn ?? cjProduct.productName ?? "").toLowerCase();
  if (isBlacklistedProductName(nameLower)) {
    return { success: false, error: "Prodotto non consentito: contiene un termine nella blacklist." };
  }

  if (!passesCatalogRules(cjProduct)) {
    return {
      success: false,
      error:
        "Prodotto non ammesso: verifica prezzo minimo €3, popolarità, stock magazzino UE e margine 50%.",
    };
  }

  let variants = cjProduct.variants ?? [];
  if (variants.length === 0) {
    variants = await getProductVariants(options.cjProductId);
  }
  const maxVariantStock = variants.reduce((max, v) => Math.max(max, v.variantStock), 0);
  const stock = maxVariantStock > 0 ? maxVariantStock : 99;
  const images = collectProductImages(cjProduct, variants);
  const reviews = await getProductComments(options.cjProductId, { pageSize: 20 });

  let productName = cjProduct.productNameEn ?? cjProduct.productName;
  let fullDescription = "";

  if (!options.skipAi) {
    try {
      const aiDesc = await generateProductDescription(
        cjProduct.productNameEn ?? cjProduct.productName,
        cjProduct.description ?? "",
        cjProduct.categoryName ?? categoryId,
        sellPrice,
        cashbackPercent
      );
      productName = aiDesc.name;
      fullDescription =
        aiDesc.bulletPoints.length > 0
          ? `${aiDesc.description}\n\n${aiDesc.bulletPoints.map((b) => `• ${b}`).join("\n")}`
          : aiDesc.description;
    } catch {
      // fall back to CJ content below
    }
  }

  if (!fullDescription.trim() && cjProduct.description) {
    fullDescription = buildStoredDescription(cjProduct.description);
  }

  const slug =
    productName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 80) +
    "-" +
    Date.now();

  const sellerId = options.sellerId ?? (await getDefaultSellerId(adminSupabase));
  if (!sellerId) {
    return { success: false, error: "Nessun account admin configurato per l'import automatico." };
  }

  const marginPercent = ((sellPrice - purchasePrice) / sellPrice) * 100;

  const { data: product, error: insertError } = await adminSupabase
    .from("products")
    .insert({
      seller_id: sellerId,
      name: productName,
      slug,
      description: fullDescription,
      price: sellPrice,
      purchase_price: purchasePrice,
      stock,
      cashback_percent: cashbackPercent,
      margin_percent: parseFloat(marginPercent.toFixed(2)),
      category_id: categoryId,
      images,
      reviews,
      listed_num: cjProduct.listedNum ?? null,
      weight_grams: cjProduct.productWeight > 0 ? Math.round(cjProduct.productWeight) : null,
      status: "published",
      cj_product_id: options.cjProductId,
      supplier: "cj",
      supplier_tier: "cj",
      supplier_price_updated_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (insertError) {
    if (options.importedByUserId) {
      await adminSupabase.from("import_logs").insert({
        imported_by: options.importedByUserId,
        cj_product_id: options.cjProductId,
        product_name: productName,
        supplier: "cj",
        purchase_price: purchasePrice,
        sell_price: sellPrice,
        cashback_percent: cashbackPercent,
        status: "failed",
        error_message: insertError.message,
      });
    }
    return { success: false, error: insertError.message };
  }

  if (options.importedByUserId) {
    await adminSupabase.from("import_logs").insert({
      imported_by: options.importedByUserId,
      product_id: product.id,
      cj_product_id: options.cjProductId,
      product_name: productName,
      supplier: "cj",
      purchase_price: purchasePrice,
      sell_price: sellPrice,
      cashback_percent: cashbackPercent,
      status: "auto_approved",
    });
  }

  return {
    success: true,
    productId: product.id,
    slug: product.slug,
    name: productName,
    sellPrice,
    cashbackPercent,
    alreadyExisted: false,
  };
}
