import { NextRequest, NextResponse } from "next/server";
import { getProductDetail } from "@/lib/dropshipping/cj";
import { createAdminClient } from "@/lib/supabase/server";

// Called nightly by Vercel Cron or external cron service
// Vercel cron config is in vercel.json
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  // Fetch all CJ products currently in DB
  const { data: products } = await supabase
    .from("products")
    .select("id, cj_product_id, price, stock, status")
    .eq("supplier", "cj")
    .not("cj_product_id", "is", null);

  if (!products?.length) {
    return NextResponse.json({ updated: 0, hidden: 0 });
  }

  let updated = 0;
  let hidden = 0;
  const errors: string[] = [];

  for (const product of products) {
    try {
      const cjData = await getProductDetail(product.cj_product_id!);

      if (!cjData) {
        // Product no longer available → hide it
        await supabase.from("products").update({ status: "draft" }).eq("id", product.id);
        hidden++;
        continue;
      }

      const newStock = cjData.variants?.[0]?.variantStock ?? 0;
      const newPurchasePrice = cjData.sellPrice;

      const updates: Record<string, unknown> = {
        supplier_price_updated_at: new Date().toISOString(),
      };

      // Update stock
      if (newStock !== product.stock) {
        updates.stock = newStock;
        if (newStock === 0) {
          updates.status = "draft"; // hide if out of stock
          hidden++;
        } else if (product.status === "draft" && newStock > 0) {
          updates.status = "published"; // restore if back in stock
        }
      }

      // If purchase price changed, recalculate sell price
      const { calculateSellPrice, calculateCashbackPercent } = await import("@/lib/dropshipping/cj");
      const newSellPrice = calculateSellPrice(newPurchasePrice);
      if (Math.abs(newSellPrice - product.price) > 0.01) {
        updates.price = newSellPrice;
        updates.purchase_price = newPurchasePrice;
        updates.cashback_percent = calculateCashbackPercent(newPurchasePrice, newSellPrice);
        updated++;
      }

      if (Object.keys(updates).length > 1) {
        await supabase.from("products").update(updates).eq("id", product.id);
      }
    } catch (err) {
      errors.push(`${product.cj_product_id}: ${String(err)}`);
    }
  }

  return NextResponse.json({
    processed: products.length,
    updated,
    hidden,
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
}
