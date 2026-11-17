import Link from "next/link";
import { StorefrontHeader } from "@/components/StorefrontHeader";

interface ConfirmPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: ConfirmPageProps) {
  const { locale } = await params;
  const { order } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#00b295]">
          Ordine ricevuto
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#253866]">
          Grazie, il pagamento è in verifica
        </h1>
        <p className="mt-4 text-gray-700">
          Se il pagamento di prova è andato a buon fine, l&apos;ordine compare in Admin e
          ricevi una email quando il provider è configurato. Il credito WheBack, se previsto
          dal piano attivo, resta in attesa per 14 giorni.
        </p>
        {order ? (
          <p className="mt-4 font-mono text-xs text-gray-500">Riferimento: {order}</p>
        ) : null}
        <Link
          href={`/${locale}/shop`}
          className="mt-8 inline-flex rounded-xl bg-[#253866] px-5 py-3 text-sm font-semibold text-white"
        >
          Torna allo shop
        </Link>
      </div>
    </main>
  );
}
