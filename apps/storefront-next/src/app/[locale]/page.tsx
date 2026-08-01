import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { DEMO_URLS } from "@/lib/demo-urls";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const tHero = await getTranslations("home.hero");

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />

      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#253866]">
          Whe&Back<sup className="text-lg">®</sup>
        </h1>
        <p className="mt-3 text-2xl font-bold text-[#253866]">{tHero("headline")}</p>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">{tHero("subline1")}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-[#253866] px-5 py-3 text-white hover:opacity-95"
            href={`/${locale}/shop`}
          >
            {tHero("cta_shop")}
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-[#253866] hover:bg-gray-50"
            href={`/${locale}/auth/register`}
          >
            {tHero("cta_register")}
          </Link>
          <a
            className="inline-flex items-center justify-center rounded-xl bg-[#00b295] px-5 py-3 text-white hover:opacity-95"
            href={DEMO_URLS.vendorRegister}
            target="_blank"
            rel="noreferrer"
          >
            Diventa fornitore
          </a>
        </div>

        <section className="mt-16 rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <h2 className="text-xl font-extrabold text-[#253866]">Per la demo: 3 posti da aprire</h2>
          <p className="mt-2 text-sm text-gray-600">
            Non serve ricordare tutto a memoria — c’è una pagina con i collegamenti grandi.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>
              <strong>Sito</strong> — clienti e shop →{" "}
              <span className="font-mono text-xs">{DEMO_URLS.storefront.replace(/^https?:\/\//, "")}</span>
            </li>
            <li>
              <strong>Fornitori</strong> — carica prodotti →{" "}
              <span className="font-mono text-xs">{DEMO_URLS.vendor.replace(/^https?:\/\//, "")}</span>
            </li>
            <li>
              <strong>Admin</strong> — vede / approva →{" "}
              <span className="font-mono text-xs">{DEMO_URLS.admin.replace(/^https?:\/\//, "")}</span>
            </li>
          </ul>
          <Link
            href={`/${locale}/istruzioni`}
            className="mt-6 inline-flex rounded-xl border border-[#253866] px-5 py-3 text-sm font-semibold text-[#253866] hover:bg-white"
          >
            Apri le istruzioni complete
          </Link>
        </section>
      </div>
    </main>
  );
}
