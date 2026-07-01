"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const params = useParams();
  const locale = params.locale as string;
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#253866" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <Image src="/logo-white.png" alt="Whe&Back®" width={140} height={40} className="h-9 w-auto" />
              <sup className="text-xs font-bold -ml-1 -mt-3 text-white">®</sup>
            </div>
            <p className="text-sm text-blue-200 mb-2">{t("company")}</p>
            <p className="text-sm text-blue-200">{t("company_number")}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
              Navigazione
            </h3>
            <ul className="space-y-2">
              {[
                { href: `/${locale}/chi-siamo`, label: "Chi Siamo" },
                { href: `/${locale}/faq`, label: "FAQ" },
                { href: `/${locale}/blog`, label: "Blog" },
                { href: `/${locale}/contatti`, label: "Contatti" },
                { href: `/${locale}/produttori`, label: "Produttori" },
                { href: `/${locale}/piano-marketing`, label: "Piano Marketing" },
                { href: `/${locale}/regole`, label: "Regole di Condotta" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Legale</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                  {t("cookies")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/beneficenza`}
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Registro Trasparenza
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-blue-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-blue-300">
            © {year} Whe&Back® — {t("rights")} — {t("company")} — {t("company_number")}
          </p>
          <p className="text-xs text-blue-300">{t("court")}</p>
        </div>
      </div>
    </footer>
  );
}
