"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PARTNER_CONTRACT } from "@/constants/partner-contract";
import { buildPartnerInviteEmailForRecipient } from "@/lib/seller/email-templates";

export type SellerInvitationRow = {
  id: string;
  email: string;
  token: string;
  company_name: string | null;
  contact_name: string | null;
  product_categories: string | null;
  notes: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Non autenticato." };

  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Accesso non autorizzato." };
  }

  return { ok: true as const, userId: user.id };
}

export async function createSellerInvitation(formData: FormData) {
  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const companyName = String(formData.get("company_name") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const productCategories = String(formData.get("product_categories") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const locale = String(formData.get("locale") ?? "it");
  const expiresDays = parseInt(String(formData.get("expires_days") ?? "30"), 10) || 30;

  if (!email || !email.includes("@")) {
    return { error: "Inserisci un indirizzo email valido." };
  }

  const token = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("seller_invitations")
    .insert({
      email,
      token,
      company_name: companyName || null,
      contact_name: contactName || null,
      product_categories: productCategories || null,
      notes: notes || null,
      invited_by: auth.userId,
      expires_at: expiresAt,
    })
    .select("id, token, email, company_name, expires_at")
    .single();

  if (error) {
    return { error: error.message };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const inviteUrl = `${siteUrl}/${locale}/partner/invito/${data.token}`;
  const contractUrl = `${siteUrl}/${locale}/legal/contratto-partner`;

  const emailDraft = buildPartnerInviteEmailForRecipient(email, {
    companyName: companyName || "Partner Whe&Back®",
    inviteUrl,
    contractUrl,
    contactName: contactName || undefined,
    notes: notes || undefined,
  });

  revalidatePath(`/${locale}/admin/venditori/inviti`);

  return {
    success: true,
    inviteUrl,
    contractUrl,
    token: data.token,
    expiresAt: data.expires_at,
    emailDraft,
  };
}

export async function getSellerInvitationByToken(token: string): Promise<SellerInvitationRow | null> {
  const admin = await createAdminClient();
  const { data } = await admin
    .from("seller_invitations")
    .select(
      "id, email, token, company_name, contact_name, product_categories, notes, expires_at, accepted_at, created_at"
    )
    .eq("token", token)
    .maybeSingle();

  return (data as SellerInvitationRow | null) ?? null;
}

export async function acceptPartnerInvitation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Devi registrarti o accedere per completare l'onboarding partner." };
  }

  const token = String(formData.get("token") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const vat = String(formData.get("vat") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const categories = String(formData.get("categories") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const supplierCountry = String(formData.get("supplier_country") ?? "IT").trim();
  const deliverySlaDays = parseInt(String(formData.get("delivery_sla_days") ?? "5"), 10) || 5;
  const signedContractNote = String(formData.get("signed_contract_note") ?? "").trim();
  const contractAccepted = formData.get("contract_accepted") === "true";
  const termsAccepted = formData.get("terms_accepted") === "true";

  if (!contractAccepted || !termsAccepted) {
    return { error: "Devi accettare contratto e termini per procedere." };
  }

  if (!company || !name || !email || !categories || !description) {
    return { error: "Compila tutti i campi obbligatori." };
  }

  const admin = await createAdminClient();
  const invitation = await getSellerInvitationByToken(token);

  if (!invitation) {
    return { error: "Invito non valido o scaduto." };
  }

  if (invitation.accepted_at) {
    return { error: "Questo invito è già stato utilizzato." };
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return { error: "Invito scaduto. Contatta Whe&Back® per un nuovo link." };
  }

  if (email.toLowerCase() !== invitation.email.toLowerCase()) {
    return {
      error: `Usa l'email dell'invito: ${invitation.email}`,
    };
  }

  const { data: existing } = await admin
    .from("seller_profiles")
    .select("id, is_active, approved_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.is_active) {
      return { success: true, alreadyActive: true };
    }
    return { error: "Hai già una candidatura in corso. Il team ti contatterà a breve." };
  }

  const now = new Date().toISOString();

  const { data: sellerProfile, error: insertError } = await admin
    .from("seller_profiles")
    .insert({
      user_id: user.id,
      company_name: company,
      vat_number: vat || null,
      contact_name: name,
      contact_email: email,
      contact_phone: phone || null,
      product_categories: categories,
      description,
      supplier_country: supplierCountry,
      delivery_sla_days: deliverySlaDays,
      invitation_id: invitation.id,
      contract_version: PARTNER_CONTRACT.VERSION,
      contract_accepted_at: now,
      signed_contract_note: signedContractNote || null,
      terms_accepted_at: now,
      is_active: false,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  await admin.from("seller_invitations").update({
    accepted_at: now,
    seller_profile_id: sellerProfile.id,
  }).eq("id", invitation.id);

  await admin.from("profiles").update({ role: "seller" }).eq("id", user.id);

  return {
    success: true,
    contractEmail: PARTNER_CONTRACT.CONTRACT_EMAIL,
  };
}

export async function listSellerInvitations(): Promise<SellerInvitationRow[]> {
  const auth = await assertAdmin();
  if (!auth.ok) return [];

  const admin = await createAdminClient();
  const { data } = await admin
    .from("seller_invitations")
    .select(
      "id, email, token, company_name, contact_name, product_categories, notes, expires_at, accepted_at, created_at"
    )
    .order("created_at", { ascending: false });

  return (data ?? []) as SellerInvitationRow[];
}

export async function markContractReceived(sellerId: string, locale: string) {
  const auth = await assertAdmin();
  if (!auth.ok) return;

  const admin = await createAdminClient();
  await admin
    .from("seller_profiles")
    .update({ contract_signed_received_at: new Date().toISOString() })
    .eq("id", sellerId);

  revalidatePath(`/${locale}/admin/venditori`);
}
