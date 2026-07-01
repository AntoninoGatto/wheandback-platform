"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function CharitySection() {
  const t = useTranslations("home.charity");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="py-20" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "#C9A227" }}>
          {t("badge")}
        </p>
        <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#253866" }}>
          {t("title")}
        </h2>
        <p className="text-5xl md:text-6xl font-black mb-2" style={{ color: "#C9A227" }}>1%</p>
        <p className="text-sm font-semibold text-gray-500 mb-4">{t("stat_label")}</p>
        <p className="text-base text-gray-600 leading-relaxed mb-8">{t("desc")}</p>
        <Link
          href={`/${locale}/beneficenza`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#253866" }}
        >
          {t("cta")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
