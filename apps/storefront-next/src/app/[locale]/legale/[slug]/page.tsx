import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { companyProfile, legalApproved } from "@/lib/company";

const PAGES = ["privacy", "cookie", "termini", "recesso", "regolamento"] as const;

interface LegalPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale, slug } = await params;
  if (!PAGES.includes(slug as (typeof PAGES)[number])) notFound();
  const seller = companyProfile();
  const approved = legalApproved();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <article className="mx-auto w-full max-w-3xl px-6 py-12">
        {approved ? (
          <>
            <h1 className="text-3xl font-extrabold text-[#253866]">{slug}</h1>
            <p className="mt-4 text-[#293241]">
              Venditore: {seller.legalName}, company number {seller.companyNumber}, {seller.addressLines.join(", ")}.
              {seller.vatUk ? ` UK VAT ${seller.vatUk}.` : ""}
              {seller.vatIt ? ` P. IVA ${seller.vatIt}.` : ""}
            </p>
            <p className="mt-4 text-[#293241]">
              I beni hanno la garanzia legale di conformità di due anni. Il recesso del consumatore si esercita dalla
              funzione online, con un numero di pratica e uno stato visibile.
            </p>
            <p className="mt-4 text-[#293241]">
              Il credito di chi segnala non è denaro, non si trasferisce e non si converte in contanti. I codici sconto
              e il codice personale sono alternativi sullo stesso ordine.
            </p>
          </>
        ) : (
          <>
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
              Pagina non pubblicata: in attesa di revisione legale.
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-[#253866]">Testo non disponibile</h1>
            <p className="mt-4 text-[#293241]">
              Il testo di questa pagina resta spento finché la revisione non è approvata.
            </p>
          </>
        )}
        <Link href={`/${locale}/recesso`} className="mt-8 inline-flex text-sm font-semibold text-[#253866]">
          Apri la funzione di recesso
        </Link>
      </article>
    </main>
  );
}
