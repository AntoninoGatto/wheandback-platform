"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, UserPlus, ShoppingBag } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("home.hero");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[560px] flex items-center">
      {/* Served directly from /public — avoids Next.js recompression/upscaling of hero assets */}
      <img
        src="/home/hero-family.jpg"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[75%_center] md:object-right"
      />

      {/* Gradient only on the left text column — keeps the family on the right sharp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(255,248,240,0.97) 0%, rgba(255,248,240,0.92) 40%, rgba(255,248,240,0.65) 52%, rgba(255,248,240,0.2) 62%, transparent 72%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-20">
        <div className="max-w-xl lg:max-w-2xl text-left">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
            style={{ backgroundColor: "rgba(0,178,149,0.12)", color: "#007a65" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00b295" }} />
            {t("badge")}
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-5" style={{ color: "#253866" }}>
            {t("headline")}
          </h1>

          <p className="text-base md:text-lg font-semibold mb-2" style={{ color: "#00b295" }}>
            {t("subline1")}
          </p>
          <p className="text-sm md:text-base text-gray-600 mb-8">{t("subline2")}</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 shadow-lg"
              style={{ backgroundColor: "#00b295" }}
            >
              <UserPlus className="w-5 h-5" />
              {t("cta_register")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base border-2 transition-colors hover:bg-white/80 bg-white/60 backdrop-blur-sm"
              style={{ borderColor: "#253866", color: "#253866" }}
            >
              <ShoppingBag className="w-5 h-5" />
              {t("cta_shop")}
            </Link>
          </div>

          <p className="text-xs text-gray-500 max-w-md">{t("microcopy")}</p>
        </div>
      </div>
    </section>
  );
}
