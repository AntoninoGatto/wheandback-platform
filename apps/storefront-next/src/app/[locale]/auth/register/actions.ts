"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { registerCustomer } from "@/lib/medusa/auth";
import type { AuthFormState } from "../login/actions";

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const locale = String(formData.get("locale") || "it");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!email || !password) {
    return { ok: false, error: "Email e password sono obbligatori." };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Le password non coincidono." };
  }

  try {
    const { token } = await registerCustomer(email, password);
    const jar = await cookies();
    jar.set("wb_customer_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Registrazione fallita.",
    };
  }

  redirect(`/${locale}`);
}
