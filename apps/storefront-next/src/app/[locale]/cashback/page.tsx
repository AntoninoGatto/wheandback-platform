import Link from "next/link";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { getLoyaltyPlan } from "@/lib/loyalty";

interface CashbackPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CashbackPage({ params }: CashbackPageProps) {
  const { locale } = await params;
  const plan = await getLoyaltyPlan();
  const percent = Math.round(plan.cashback_rate * 100);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm font-semibold text-[#00b295]">{plan.headline}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#253866]">Il mio cashback</h1>
        <p className="mt-4 text-gray-700">
          Il piano attivo riconosce il {percent}% del netto prodotti pagato (IVA, spedizione e
          credito usato esclusi). Il credito resta in attesa {plan.unlock_days} giorni, poi diventa
          utilizzabile solo come sconto. Non è convertibile in denaro e non è trasferibile.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["In attesa", "Si sblocca dopo il periodo del piano"],
            ["Disponibile", "Si usa in checkout come sconto"],
            ["Usato", "Già applicato a un ordine"],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-gray-100 p-4">
              <dt className="font-extrabold text-[#253866]">{title}</dt>
              <dd className="mt-2 text-sm text-gray-600">{copy}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-gray-600">
          La timeline del tuo conto compare dopo l&apos;accesso: l&apos;API{" "}
          <code>/store/loyalty/cashback</code> legge il ledger del cliente.
        </p>
        <Link href={`/${locale}/auth/login`} className="mt-4 inline-flex text-sm font-semibold text-[#253866]">
          Accedi per il dettaglio
        </Link>
      </div>
    </main>
  );
}
