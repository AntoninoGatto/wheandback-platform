"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";

export default function ReferralHighlight() {
  const t = useTranslations("home.referral_highlight");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(0,178,149,0.25)" }}
            >
              <Users className="w-8 h-8" style={{ color: "#00b295" }} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{t("title")}</h2>
              <p className="text-white/75 text-sm md:text-base max-w-xl leading-relaxed">{t("desc")}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/referral`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#00b295", color: "white" }}
          >
            {t("cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
