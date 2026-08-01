import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listProducts } from "@/lib/medusa/store";
import { MedusaError } from "@/lib/medusa/http";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { DEMO_URLS } from "@/lib/demo-urls";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  const t = await getTranslations("shop");

  let products: Awaited<ReturnType<typeof listProducts>>["products"] = [];
  let count = 0;
  let errorMessage: string | null = null;

  try {
    const data = await listProducts({ limit: 24, offset: 0 });
    products = data.products;
    count = data.count;
  } catch (e) {
    errorMessage =
      e instanceof MedusaError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Errore nel caricamento prodotti.";
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <StorefrontHeader locale={locale} />

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#253866]">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessage
              ? "Catalogo non disponibile al momento"
              : count === 0
                ? "Nessun prodotto in vetrina"
                : `${count} prodotti`}
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-lg font-semibold text-[#253866]">Shop temporaneamente non collegato</p>
            <p className="mt-2 text-sm text-amber-900">
              Controlla che Mercur sia avviato (porta 9000). Se serve aiuto, apri le istruzioni.
            </p>
            <p className="mt-3 font-mono text-xs text-amber-800/80">{errorMessage}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={`/${locale}/istruzioni`}
                className="inline-flex rounded-xl bg-[#253866] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Apri le istruzioni
              </Link>
              <a
                href={DEMO_URLS.admin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl border border-[#253866] px-5 py-3 text-sm font-semibold text-[#253866] hover:bg-white"
              >
                Apri admin
              </a>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-xl font-extrabold text-[#253866]">Ancora nessun prodotto</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-600">
              Lo shop è pronto. Quando un fornitore carica un articolo (e risulta visibile),
              comparirà qui. Per la demo puoi registrarti come fornitore adesso.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={DEMO_URLS.vendorRegister}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl bg-[#00b295] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Diventa fornitore
              </a>
              <Link
                href={`/${locale}/istruzioni`}
                className="inline-flex rounded-xl border border-[#253866] px-5 py-3 text-sm font-semibold text-[#253866] hover:bg-gray-50"
              >
                Come funziona la demo
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/shop/${p.id}`}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow"
              >
                <div className="text-sm font-semibold text-[#253866]">{p.title}</div>
                <div className="mt-1 text-xs text-gray-500">{p.id}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
