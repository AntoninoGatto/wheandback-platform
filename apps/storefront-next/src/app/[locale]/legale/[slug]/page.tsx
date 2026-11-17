import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontHeader } from "@/components/StorefrontHeader";

const PAGES: Record<string, { title: string; body: string }> = {
  privacy: {
    title: "Privacy",
    body: "Questa informativa descriverà titolare, basi giuridiche e diritti. Non è un testo legale valido.",
  },
  cookie: {
    title: "Cookie",
    body: "Cookie tecnici di sessione e, per gli inviti, un cookie di attribuzione per 30 giorni. Manca il dettaglio del fornitore.",
  },
  termini: {
    title: "Termini",
    body: "Condizioni di vendita da completare con ragione sociale, prezzi IVA inclusa e legge applicabile.",
  },
  recesso: {
    title: "Recesso",
    body: "Il diritto di recesso dei consumatori va descritto con tempi e modalità. Bozza vuota.",
  },
  regolamento: {
    title: "Regolamento programma premi",
    body: "Il credito WheBack non è denaro, non si trasferisce e non si converte in contanti. Percentuali e periodi dipendono dal piano approvato. Testo da far validare.",
  },
};

interface LegalPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale, slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <article className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          BOZZA DA VALIDARE
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-[#253866]">{page.title}</h1>
        <p className="mt-4 text-gray-700">{page.body}</p>
        <Link href={`/${locale}`} className="mt-8 inline-flex text-sm font-semibold text-[#253866]">
          Torna alla home
        </Link>
      </article>
    </main>
  );
}
