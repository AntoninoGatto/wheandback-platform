"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { UserPlus, Heart, Users, ShoppingBag } from "lucide-react";

export default function HomeCTAGrid() {
  const t = useTranslations("home.cta_grid");
  const params = useParams();
  const locale = params.locale as string;

  const items = [
    {
      href: `/${locale}/auth/register`,
      label: t("register"),
      icon: UserPlus,
      variant: "teal" as const,
    },
    {
      href: `/${locale}/referral`,
      label: t("referral"),
      icon: Users,
      variant: "teal" as const,
    },
    {
      href: `/${locale}/beneficenza`,
      label: t("charity"),
      icon: Heart,
      variant: "navy" as const,
    },
    {
      href: `/${locale}/shop`,
      label: t("shop"),
      icon: ShoppingBag,
      variant: "navy" as const,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-10">
          <Image src="/logo.png" alt="Whe&Back" width={180} height={50} className="h-10 w-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map(({ href, label, icon: Icon, variant }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center gap-4 p-6 rounded-3xl transition-transform hover:scale-[1.02] min-h-[120px]"
              style={{
                background:
                  variant === "teal"
                    ? "linear-gradient(145deg, rgba(0,178,149,0.15) 0%, rgba(0,178,149,0.05) 100%)"
                    : "linear-gradient(145deg, rgba(37,56,102,0.12) 0%, rgba(37,56,102,0.04) 100%)",
                border: `2px solid ${variant === "teal" ? "#00b295" : "#253866"}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: variant === "teal" ? "#00b295" : "#253866",
                  color: "white",
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <p
                className="text-sm md:text-base font-black leading-snug"
                style={{ color: variant === "teal" ? "#007a65" : "#253866" }}
              >
                {label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
