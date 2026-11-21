import Link from "next/link";
import { getProduct } from "@/lib/medusa/store";
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "@/lib/medusa/config";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { VariantOffers, type OfferVariant } from "@/components/VariantOffers";
import { companyProfile } from "@/lib/company";

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

type ProductWithVariants = {
  id: string;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  variants?: { id: string; title?: string | null; sku?: string | null }[];
};

function textMeta(metadata: Record<string, unknown> | null | undefined, key: string): string {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "Non indicato dal fornitore";
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const { product } = await getProduct(id);
  const detailed = product as ProductWithVariants;
  const variants: OfferVariant[] = detailed.variants?.length
    ? detailed.variants
    : [{ id: product.id, title: product.title }];
  const seller = companyProfile();

  return (
    <main className="flex min-h-screen flex-col bg-[#F1F0F1]">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link href={`/${locale}/shop`} className="text-sm font-semibold text-[#253866] hover:opacity-80">
          ← Torna allo Shop
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#253866]">{product.title}</h1>
        {product.description ? <p className="mt-4 text-[#293241]">{product.description}</p> : null}
        <VariantOffers
          variants={variants}
          backendUrl={MEDUSA_BACKEND_URL}
          publishableKey={MEDUSA_PUBLISHABLE_KEY}
        />
        <section className="mt-8 rounded-2xl bg-white p-5 text-sm text-[#293241]">
          <h2 className="font-extrabold text-[#253866]">Garanzia legale di conformità</h2>
          <p className="mt-2">
            I beni di consumo hanno la garanzia legale di conformità di due anni, secondo la disciplina europea armonizzata.
            Il venditore è {seller.legalName}, company number {seller.companyNumber}.
          </p>
        </section>
        <section className="mt-4 rounded-2xl bg-white p-5 text-sm text-[#293241]">
          <h2 className="font-extrabold text-[#253866]">Sicurezza del prodotto</h2>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="font-semibold text-[#253866]">Fabbricante</dt>
              <dd>{textMeta(detailed.metadata, "gpsr_manufacturer")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#253866]">Persona responsabile nell&apos;UE</dt>
              <dd>{textMeta(detailed.metadata, "gpsr_eu_responsible")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#253866]">Avvertenze</dt>
              <dd>{textMeta(detailed.metadata, "gpsr_warnings")}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
