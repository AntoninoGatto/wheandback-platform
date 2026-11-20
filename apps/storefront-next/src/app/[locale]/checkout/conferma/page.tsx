import Link from "next/link";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { ConfirmedSnapshot } from "@/components/ConfirmedSnapshot";

interface ConfirmPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrderConfirmationPage({ params }: ConfirmPageProps) {
  const { locale } = await params;

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#00B295]">Ordine ricevuto</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#253866]">Grazie, il pagamento è in verifica</h1>
        <p className="mt-4 text-[#293241]">
          Lo snapshot accettato in checkout resta sulla conferma e nella email di dettaglio.
        </p>
        <ConfirmedSnapshot />
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
