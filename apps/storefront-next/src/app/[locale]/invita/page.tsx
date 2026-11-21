import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { InviteSimulator } from "@/components/InviteSimulator";

interface InvitePageProps {
  params: Promise<{ locale: string }>;
}

const TIERS = [
  ["50% o più di sconto fornitore", "35%"],
  ["42% o più", "27%"],
  ["36% o più", "21%"],
] as const;

export default async function InvitePage({ params }: InvitePageProps) {
  const { locale } = await params;
  const t = await getTranslations("referral");

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-[#253866]">{t("title")}</h1>
        <p className="mt-4 text-[#293241]">{t("desc")}</p>
        <p className="mt-4 text-[#293241]">
          Chi compra inserisce un solo codice personale e paga il prezzo pieno. Il premio si calcola sul prezzo senza IVA,
          riga per riga. Non c&apos;è un legame fisso tra invitante e invitato. Segnalare se stessi è bloccato.
        </p>
        <ul className="mt-8 space-y-2 rounded-2xl border border-[#F1F0F1] p-5 text-sm text-[#293241]">
          {TIERS.map(([band, rate]) => (
            <li key={band}>
              Fascia {band}: {rate} del netto, su ogni ordine in cui il codice è usato.
            </li>
          ))}
        </ul>
        <InviteSimulator />
        <Link href={`/${locale}/auth/register`} className="mt-6 inline-flex text-sm font-semibold text-[#253866]">
          Crea un account
        </Link>
      </div>
    </main>
  );
}
