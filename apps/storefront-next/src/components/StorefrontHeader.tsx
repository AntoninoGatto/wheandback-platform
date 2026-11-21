import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DEMO_URLS } from "@/lib/demo-urls";
import { BrandMark } from "@/components/BrandMark";

interface StorefrontHeaderProps {
  locale: string;
}

export async function StorefrontHeader({ locale }: StorefrontHeaderProps) {
  const tNav = await getTranslations("nav");

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href={`/${locale}`} className="text-xl font-extrabold text-[#253866]">
          <BrandMark />
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#253866]">
          <Link href={`/${locale}/shop`} className="hover:opacity-80">
            {tNav("shop")}
          </Link>
          <Link href={`/${locale}/bonus`} className="hover:opacity-80">
            {tNav("bonus")}
          </Link>
          <Link href={`/${locale}/cashback`} className="hover:opacity-80">
            {tNav("cashback")}
          </Link>
          <Link href={`/${locale}/invita`} className="hover:opacity-80">
            Invita
          </Link>
          <Link href={`/${locale}/legale/termini`} className="hover:opacity-80">
            Note legali
          </Link>
          <Link href={`/${locale}/auth/login`} className="hover:opacity-80">
            {tNav("login")}
          </Link>
          <Link href={`/${locale}/auth/register`} className="hover:opacity-80">
            {tNav("register")}
          </Link>
          <Link href={`/${locale}/cart`} className="hover:opacity-80">
            Carrello
          </Link>
          <Link href={`/${locale}/istruzioni`} className="hover:opacity-80">
            Istruzioni
          </Link>
          <a
            href={DEMO_URLS.vendorRegister}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-[#00B295] px-3 py-1.5 text-white hover:opacity-95"
          >
            Diventa fornitore
          </a>
        </nav>
      </div>
    </header>
  );
}
