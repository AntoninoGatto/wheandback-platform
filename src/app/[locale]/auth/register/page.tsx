"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, UserPlus, AlertTriangle, CheckCircle } from "lucide-react";
import { register } from "@/lib/auth/actions";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string;
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError("Le password non corrispondono.");
      return;
    }

    const formData = new FormData(form);
    formData.set("locale", locale);
    formData.set("ageConfirmed", String(ageConfirmed));
    formData.set("privacyAccepted", String(privacyAccepted));

    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#f8fafc" }}>
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(0,178,149,0.1)" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#00b295" }} />
          </div>
          <h2 className="text-xl font-black mb-3" style={{ color: "#253866" }}>
            Registrazione completata!
          </h2>

          {/* Email confirmation notice */}
          <div
            className="rounded-xl p-4 mb-5 text-left"
            style={{ backgroundColor: "rgba(37,56,102,0.05)", border: "1px solid rgba(37,56,102,0.15)" }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: "#253866" }}>
              📧 Controlla la tua email
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ti abbiamo inviato un link di conferma all&apos;indirizzo che hai indicato.
              Clicca sul link per attivare il tuo account, poi torna qui per accedere.
            </p>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Non vedi la mail? Controlla anche la cartella <strong>Spam</strong> o{" "}
            <strong>Posta indesiderata</strong>.
          </p>

          <Link href={`/${locale}/auth/login`}
            className="inline-block px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#00b295" }}>
            Vai al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8fafc" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white"
        style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
      >
        <div className="max-w-sm text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            <Image src="/logo.png" alt="Whe&Back®" width={200} height={56} className="h-14 w-auto brightness-0 invert" />
            <sup className="text-base -ml-2 -mt-6 text-white">®</sup>
          </div>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Aiutami a Cambiare il Mondo, Compra e Vendi anche Tu!
          </p>
          <div className="space-y-3 text-left">
            {[
              "Cashback dal 5% al 35% su ogni acquisto",
              "Link referral personale e premi multilivello",
              "1% del fatturato donato a beneficenza ogni mese",
              "5 lingue, spedizioni in tutto il mondo",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#00b295" }}>
                  <span className="text-white text-xs font-black">✓</span>
                </div>
                <p className="text-white/70 text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-1 mb-8">
            <Image src="/logo.png" alt="Whe&Back®" width={150} height={44} className="h-11 w-auto" />
            <sup className="text-xs -ml-1 -mt-4" style={{ color: "#253866" }}>®</sup>
          </div>

          <h1 className="text-2xl font-black mb-1" style={{ color: "#253866" }}>
            {t("register_title")}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {t("have_account")}{" "}
            <Link href={`/${locale}/auth/login`} className="font-semibold" style={{ color: "#00b295" }}>
              {t("login")}
            </Link>
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                Nome Completo *
              </label>
              <input
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Mario Rossi"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                {t("email")} *
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tua@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                {t("password")} *
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Min. 8 caratteri"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                {t("confirm_password")} *
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Ripeti la password"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] transition-colors"
              />
            </div>

            {/* Age — required by law (minors blocked) */}
            <label
              className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors"
              style={{ borderColor: ageConfirmed ? "#00b295" : "#e2e8f0", backgroundColor: ageConfirmed ? "rgba(0,178,149,0.04)" : "white" }}
            >
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                required
              />
              <span className="text-xs text-gray-600">{t("age_confirm")} *</span>
            </label>

            {/* Privacy — GDPR required */}
            <label
              className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors"
              style={{ borderColor: privacyAccepted ? "#00b295" : "#e2e8f0", backgroundColor: privacyAccepted ? "rgba(0,178,149,0.04)" : "white" }}
            >
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                required
              />
              <span className="text-xs text-gray-600">
                Accetto la{" "}
                <Link href={`/${locale}/privacy`} target="_blank" style={{ color: "#00b295" }}>Privacy Policy</Link>
                {" "}e i{" "}
                <Link href={`/${locale}/termini`} target="_blank" style={{ color: "#00b295" }}>Termini e Condizioni</Link>
                {" "}di Buy All Free LTD *
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending || !ageConfirmed || !privacyAccepted}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: "#00b295" }}
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isPending ? "Registrazione in corso..." : t("register_btn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
