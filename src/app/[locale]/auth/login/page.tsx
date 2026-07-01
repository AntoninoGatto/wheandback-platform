"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, LogIn, AlertTriangle } from "lucide-react";
import { login } from "@/lib/auth/actions";

export default function LoginPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const redirectTo = searchParams.get("redirect") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);
    if (redirectTo) formData.set("redirect", redirectTo);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8fafc" }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white"
        style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
      >
        <div className="max-w-sm text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            <Image src="/logo.png" alt="Whe&Back®" width={200} height={56} className="h-14 w-auto brightness-0 invert" />
            <sup className="text-base -ml-2 -mt-6 text-white">®</sup>
          </div>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            La vita è un cerchio. Fai un acquisto con Whe&Back® e tutto torna.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "35%", label: "Cashback Max" },
              { value: "∞", label: "Inviti Referral" },
              { value: "1%", label: "Donazione Mensile" },
              { value: "5", label: "Lingue" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center p-4 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-2xl font-black" style={{ color: "#00b295" }}>{value}</p>
                <p className="text-white/50 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-1 mb-8">
            <Image src="/logo.png" alt="Whe&Back®" width={150} height={44} className="h-11 w-auto" />
            <sup className="text-xs -ml-1 -mt-4" style={{ color: "#253866" }}>®</sup>
          </div>

          <h1 className="text-2xl font-black mb-1" style={{ color: "#253866" }}>
            {t("login_title")}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {t("no_account")}{" "}
            <Link href={`/${locale}/auth/register`} className="font-semibold" style={{ color: "#00b295" }}>
              {t("register")}
            </Link>
          </p>

          {/* Error alert */}
          {error && (
            <div
              className="flex items-start gap-2 p-4 rounded-xl mb-4 text-sm"
              style={
                error.toLowerCase().includes("confirm") || error.toLowerCase().includes("not confirmed")
                  ? { backgroundColor: "rgba(37,56,102,0.06)", border: "1px solid rgba(37,56,102,0.2)" }
                  : { backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }
              }
            >
              <AlertTriangle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={
                  error.toLowerCase().includes("confirm") || error.toLowerCase().includes("not confirmed")
                    ? { color: "#253866" }
                    : { color: "#dc2626" }
                }
              />
              <div>
                {error.toLowerCase().includes("confirm") || error.toLowerCase().includes("not confirmed") ? (
                  <>
                    <p className="font-bold text-xs mb-1" style={{ color: "#253866" }}>
                      Email non ancora confermata
                    </p>
                    <p className="text-xs text-gray-500">
                      Controlla la tua casella email (anche Spam) e clicca sul link di conferma che ti abbiamo inviato durante la registrazione.
                    </p>
                  </>
                ) : (
                  <span>{error}</span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                {t("email")}
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tua@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b295]/30 focus:border-[#00b295] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold" style={{ color: "#253866" }}>
                  {t("password")}
                </label>
                <Link href={`/${locale}/auth/forgot-password`} className="text-xs" style={{ color: "#00b295" }}>
                  {t("forgot_password")}
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b295]/30 focus:border-[#00b295] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: "#00b295" }}
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isPending ? "Accesso in corso..." : t("login_btn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
