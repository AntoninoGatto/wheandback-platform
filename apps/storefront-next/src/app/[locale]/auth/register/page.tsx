"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { registerAction } from "./actions";
import type { AuthFormState } from "../login/actions";

const initialState: AuthFormState = { ok: true };

export default function RegisterPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = String(params.locale || "it");
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-[#253866]">{t("register_title")}</h1>

        <form action={formAction} className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#253866]/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#253866]/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
              {t("confirm_password")}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#253866]/20"
            />
          </div>

          {state?.ok === false ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[#253866] px-4 py-2.5 text-white hover:opacity-95 disabled:opacity-50"
          >
            {pending ? "..." : t("register_btn")}
          </button>

          <p className="text-sm text-gray-600">
            {t("have_account")}{" "}
            <Link href={`/${locale}/auth/login`} className="font-semibold text-[#253866]">
              {t("login")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
