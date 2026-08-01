"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, LogOut, Globe } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { logout } from "@/lib/auth/actions";

const LOCALES = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const params = useParams();
  const locale = params.locale as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn } = useUser();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const switchLocalePath = (newLocale: string) => {
    // Replace the current locale prefix with the new one
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  };

  const navLinks = [
    { href: `/${locale}/shop`, label: t("shop") },
    { href: `/${locale}/cashback`, label: t("cashback") },
    { href: `/${locale}/referral`, label: t("referral") },
    { href: `/${locale}/beneficenza`, label: t("charity") },
    { href: `/${locale}/produttori`, label: t("producers") },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.5rem] py-2">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-1 flex-shrink-0">
            <Image src="/logo.png" alt="Whe&Back®" width={200} height={56} className="h-12 w-auto sm:h-14" priority />
            <sup className="text-xs font-bold -ml-1 -mt-3" style={{ color: "#253866" }}>®</sup>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold transition-colors hover:text-[#00b295]"
                style={{ color: "#253866" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language switcher */}
          <div className="hidden md:flex items-center relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              style={{ color: "#253866" }}
            >
              <Globe className="w-4 h-4" />
              <span>{currentLocale.flag} {currentLocale.code.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1 min-w-[140px]">
                {LOCALES.map((loc) => (
                  <Link
                    key={loc.code}
                    href={switchLocalePath(loc.code)}
                    onClick={() => setLangOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: loc.code === locale ? "#00b295" : "#253866", fontWeight: loc.code === locale ? 700 : 500 }}
                  >
                    <span>{loc.flag}</span>
                    <span>{loc.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border-2 transition-colors hover:bg-[#253866] hover:text-white"
                  style={{ borderColor: "#253866", color: "#253866" }}
                >
                  <User className="w-4 h-4" />
                  {t("dashboard")}
                </Link>
                <form action={logout.bind(null, locale)}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-red-50 hover:text-red-600"
                    style={{ color: "#253866" }}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border-2 transition-colors hover:bg-[#253866] hover:text-white"
                  style={{ borderColor: "#253866", color: "#253866" }}
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#00b295" }}
                >
                  {t("register")}
                </Link>
              </>
            )}
            <Link href={`/${locale}/dashboard`} className="p-2 rounded-lg hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5" style={{ color: "#253866" }} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" style={{ color: "#253866" }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: "#253866" }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold py-2"
              style={{ color: "#253866" }}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile language switcher */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {LOCALES.map((loc) => (
              <Link
                key={loc.code}
                href={switchLocalePath(loc.code)}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={loc.code === locale
                  ? { backgroundColor: "#253866", color: "white", borderColor: "#253866" }
                  : { borderColor: "#e2e8f0", color: "#64748b" }}
              >
                {loc.flag} {loc.code.toUpperCase()}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100">
            {isLoggedIn ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border-2 text-center"
                  style={{ borderColor: "#253866", color: "#253866" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("dashboard")}
                </Link>
                <form action={logout.bind(null, locale)}>
                  <button type="submit" className="w-full text-sm font-semibold px-4 py-2 rounded-lg text-center text-red-500 border border-red-200">
                    {t("logout")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border-2 text-center"
                  style={{ borderColor: "#253866", color: "#253866" }}
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg text-white text-center"
                  style={{ backgroundColor: "#00b295" }}
                >
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
