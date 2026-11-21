import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StorefrontHeader } from "@/components/StorefrontHeader";

interface CashbackPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CashbackPage({ params }: CashbackPageProps) {
  const { locale } = await params;
  const t = await getTranslations("cashback");

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-[#253866]">{t("title")}</h1>
        <p className="mt-4 text-[#293241]">{t("info_desc")}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Segnalatore", "Paghi il prezzo pieno. Il premio va a chi indichi in quell'ordine."],
            ["Nessun codice", "La stessa quota resta nel budget interno dell'azienda."],
            ["Codici sconto", "Sconto sulla riga coperta. Premio e quota interna a zero su tutto l'ordine."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-[#F1F0F1] p-4">
              <dt className="font-extrabold text-[#253866]">{title}</dt>
              <dd className="mt-2 text-sm text-[#293241]">{copy}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-[#293241]">{t("balance")}</p>
        <Link href={`/${locale}/bonus`} className="mt-4 inline-flex text-sm font-semibold text-[#253866]">
          Vedi i codici attivi
        </Link>
      </div>
    </main>
  );
}
