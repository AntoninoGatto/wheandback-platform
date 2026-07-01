"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase() +
    Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "it";
  const redirectTo = (formData.get("redirect") as string) || `/${locale}/dashboard`;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo.startsWith("/") ? redirectTo : `/${locale}/dashboard`);
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const locale = (formData.get("locale") as string) || "it";
  const ageConfirmed = formData.get("ageConfirmed") === "true";
  const privacyAccepted = formData.get("privacyAccepted") === "true";

  if (!ageConfirmed || !privacyAccepted) {
    return { error: "Devi accettare i termini e confermare l'età per registrarti." };
  }

  const referralCode = generateReferralCode();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        referral_code: referralCode,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${locale}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.session) {
    // Email confirmation required
    return { success: "Controlla la tua email per confermare la registrazione." };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function logout(locale: string = "it") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}
