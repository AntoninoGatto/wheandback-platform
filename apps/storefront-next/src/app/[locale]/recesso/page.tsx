import { StorefrontHeader } from "@/components/StorefrontHeader";
import { SupportForm } from "@/components/SupportForm";
import { companyProfile } from "@/lib/company";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function WithdrawalPage({ params }: PageProps) {
  const { locale } = await params;
  const seller = companyProfile();
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-xl px-6 py-12">
        <SupportForm
          fixedType="withdrawal"
          title="Recesso online"
          intro={`Funzione di recesso ai sensi dell'art. 54-bis del Codice del Consumo. La dichiarazione è inviata a ${seller.legalName}, company number ${seller.companyNumber}, ${seller.addressLines.join(", ")}.`}
        />
      </div>
    </main>
  );
}
