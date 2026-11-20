import { StorefrontHeader } from "@/components/StorefrontHeader";
import { SupportForm } from "@/components/SupportForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AssistancePage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <StorefrontHeader locale={locale} />
      <div className="mx-auto w-full max-w-xl px-6 py-12">
        <SupportForm
          title="Assistenza e resi"
          intro="Apri una pratica di assistenza o di reso. Il numero e lo stato restano visibili."
        />
      </div>
    </main>
  );
}
