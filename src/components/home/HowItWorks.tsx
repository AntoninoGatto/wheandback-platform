"use client";

import { useTranslations } from "next-intl";
import { UserPlus, ShoppingBag, Users, Heart } from "lucide-react";

export default function HowItWorks() {
  const t = useTranslations("home.how_it_works");

  const steps = [
    { icon: UserPlus, titleKey: "step1_title", descKey: "step1_desc", step: "01" },
    { icon: ShoppingBag, titleKey: "step2_title", descKey: "step2_desc", step: "02" },
    { icon: Users, titleKey: "step3_title", descKey: "step3_desc", step: "03" },
    { icon: Heart, titleKey: "step4_title", descKey: "step4_desc", step: "04" },
  ] as const;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#253866" }}>
            {t("title")}
          </h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: "#00b295" }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, titleKey, descKey, step }) => (
            <div key={step} className="relative text-center group">
              <div
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-transform group-hover:scale-105"
                style={{ backgroundColor: "rgba(37, 56, 102, 0.06)" }}
              >
                <Icon className="w-9 h-9" style={{ color: "#253866" }} />
                <span
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center"
                  style={{ backgroundColor: "#00b295" }}
                >
                  {step}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#253866" }}>
                {t(titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
