"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validatePartnerProduct } from "@/lib/seller/partner-catalog-rules";
import { revalidatePath } from "next/cache";

export type CreatePartnerProductResult =
  | { success: true; slug: string }
  | { success: false; error: string };

async function assertActiveSeller(userId: string) {
  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("seller_profiles")
    .select("is_active, approved_at, rejected_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile?.is_active || !profile.approved_at) {
    return { ok: false as const, error: "Il tuo account partner non è ancora attivo. Attendi l'approvazione del team." };
  }

  if (profile.rejected_at) {
    return { ok: false as const, error: "La tua candidatura partner non è attiva." };
  }

  return { ok: true as const };
}

export async function createPartnerProduct(formData: FormData): Promise<CreatePartnerProductResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sessione scaduta. Accedi di nuovo." };
  }

  const gate = await assertActiveSeller(user.id);
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "");
  const price = parseFloat(String(formData.get("price") ?? ""));
  const purchase_price = parseFloat(String(formData.get("purchase_price") ?? ""));
  const cashback_percent = parseFloat(String(formData.get("cashback_percent") ?? ""));
  const stock = parseInt(String(formData.get("stock") ?? ""), 10);

  const validation = validatePartnerProduct({
    name,
    description,
    category_id,
    price,
    purchase_price,
    cashback_percent,
    stock,
  });

  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const slug =
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 80) +
    "-" +
    Date.now();

  const marginPercent = ((price - purchase_price) / price) * 100;

  const { error } = await supabase.from("products").insert({
    seller_id: user.id,
    name,
    slug,
    description,
    price,
    purchase_price,
    stock,
    cashback_percent,
    margin_percent: parseFloat(marginPercent.toFixed(2)),
    category_id,
    status: "pending_approval",
    images: [],
    supplier: "manual",
    supplier_tier: "partner",
  });

  if (error) {
    if (error.message.toLowerCase().includes("blacklist")) {
      return {
        success: false,
        error: "Prodotto non consentito: contiene un termine nella blacklist aziendale.",
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/seller/prodotti");
  return { success: true, slug };
}
