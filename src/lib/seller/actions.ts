"use server";

import { createClient } from "@/lib/supabase/server";
import { PARTNER_CONTRACT } from "@/constants/partner-contract";

export async function submitSellerApplication(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const company = formData.get("company") as string;
  const vat = formData.get("vat") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const categories = formData.get("categories") as string;
  const description = formData.get("description") as string;
  const supplierCountry = (formData.get("supplier_country") as string) || "IT";
  const deliverySlaDays = parseInt(String(formData.get("delivery_sla_days") ?? "5"), 10) || 5;
  const agreed = formData.get("agreed") === "true";
  const contractAccepted = formData.get("contract_accepted") === "true";

  if (!agreed || !contractAccepted) {
    return { error: "Devi accettare termini e contratto di convenzionamento." };
  }

  if (!user) {
    return { error: "Devi essere registrato e loggato per candidarti come venditore." };
  }

  const { data: existing } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "Hai già inviato una candidatura. Il team ti contatterà a breve." };
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("seller_profiles").insert({
    user_id: user.id,
    company_name: company,
    vat_number: vat,
    contact_name: name,
    contact_email: email,
    contact_phone: phone,
    product_categories: categories,
    description,
    supplier_country: supplierCountry,
    delivery_sla_days: deliverySlaDays,
    contract_version: PARTNER_CONTRACT.VERSION,
    contract_accepted_at: now,
    terms_accepted_at: now,
    is_active: false,
  });

  if (error) {
    return { error: error.message };
  }

  await supabase
    .from("profiles")
    .update({ role: "seller" })
    .eq("id", user.id);

  return { success: true, contractEmail: PARTNER_CONTRACT.CONTRACT_EMAIL };
}
