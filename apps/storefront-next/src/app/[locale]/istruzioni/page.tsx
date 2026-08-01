import Link from "next/link";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { DEMO_URLS } from "@/lib/demo-urls";

interface IstruzioniPageProps {
  params: Promise<{ locale: string }>;
}

export default async function IstruzioniPage({ params }: IstruzioniPageProps) {
  const { locale } = await params;

  const cards = [
    {
      title: "1. Sito (clienti)",
      description:
        "Qui i clienti navigano lo shop, si registrano e vedono i prodotti. È la vetrina pubblica.",
      href: DEMO_URLS.storefront,
      label: "Apri il sito",
      hint: "localhost:3002",
    },
    {
      title: "2. Fornitori (vendor)",
      description:
        "Qui i fornitori si registrano e caricano prodotti (titoli, immagini, prezzi). Poi appaiono nello shop.",
      href: DEMO_URLS.vendor,
      label: "Apri area fornitori",
      hint: "localhost:9000/seller",
      secondaryHref: DEMO_URLS.vendorRegister,
      secondaryLabel: "Registrati come fornitore",
    },
    {
      title: "3. Admin",
      description:
        "Qui l’amministratore vede i prodotti e può gestirli / approvare. Usa questa finestra per controllare il marketplace.",
      href: DEMO_URLS.admin,
      label: "Apri admin",
      hint: "localhost:9000/dashboard",
    },
  ] as const;

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#00b295]">
          Demo Whe&Back®
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#253866]">
          Istruzioni in 1 minuto
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Apri questi tre collegamenti (meglio in schede separate). Non serve altro per
          mostrare come funziona la macchina: sito + fornitori + admin.
        </p>

        <ol className="mt-10 space-y-5">
          {cards.map((card) => (
            <li
              key={card.title}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6"
            >
              <h2 className="text-lg font-extrabold text-[#253866]">{card.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{card.description}</p>
              <p className="mt-2 font-mono text-xs text-gray-500">{card.hint}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl bg-[#253866] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  {card.label}
                </a>
                {"secondaryHref" in card && card.secondaryHref ? (
                  <a
                    href={card.secondaryHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-xl bg-[#00b295] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
                  >
                    {card.secondaryLabel}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl border border-[#00b295]/30 bg-[#00b295]/5 p-6">
          <h2 className="text-base font-extrabold text-[#253866]">Flusso demo consigliato</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
            <li>Apri il sito e vai allo Shop (anche vuoto va bene).</li>
            <li>Registrati come fornitore e carica 1 prodotto di prova.</li>
            <li>Controlla in Admin che il prodotto ci sia.</li>
            <li>Ricarica lo Shop: il prodotto dovrebbe comparire.</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#253866] hover:bg-gray-50"
          >
            Vai allo Shop
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#253866] hover:bg-gray-50"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    </main>
  );
}
