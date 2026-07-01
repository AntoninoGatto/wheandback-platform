"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function WelcomeSection() {
  const t = useTranslations("home.welcome");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="py-20" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-400 mb-4">{t("eyebrow")}</p>

        <h2 className="text-3xl md:text-4xl font-black mb-6 italic" style={{ color: "#253866", fontFamily: "Georgia, serif" }}>
          {t("title")}
        </h2>

        <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
          {t("body")}
        </p>

        <Link
          href={`/${locale}/auth/register`}
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#00b295", color: "white" }}
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
