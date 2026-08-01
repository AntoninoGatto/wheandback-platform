"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginCustomer } from "@/lib/medusa/auth";

export type AuthFormState = {
  ok: boolean;
  error?: string;
};

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const locale = String(formData.get("locale") || "it");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, error: "Email e password sono obbligatori." };
  }

  try {
    const { token } = await loginCustomer(email, password);
    const jar = await cookies();
    jar.set("wb_customer_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Login fallito." };
  }

  redirect(`/${locale}`);
}
