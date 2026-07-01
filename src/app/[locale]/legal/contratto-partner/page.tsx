import PrintButton from "@/components/legal/PrintButton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  PARTNER_CONTRACT,
  PARTNER_CONTRACT_SECTIONS,
  PARTNER_PRODUCT_RULES_SUMMARY,
} from "@/constants/partner-contract";

export default async function ContrattoPartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#00b295" }}>
            Versione {PARTNER_CONTRACT.VERSION}
          </p>
          <h1 className="text-3xl font-black mb-4" style={{ color: "#253866" }}>
            {PARTNER_CONTRACT.TITLE}
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Tra <strong>{PARTNER_CONTRACT.HOLDER}</strong> (gestore della piattaforma{" "}
            <strong>{PARTNER_CONTRACT.PLATFORM}</strong>) e il Partner convenzionato.
            Documento da firmare e inviare a{" "}
            <a href={`mailto:${PARTNER_CONTRACT.CONTRACT_EMAIL}`} className="underline" style={{ color: "#00b295" }}>
              {PARTNER_CONTRACT.CONTRACT_EMAIL}
            </a>
            .
          </p>

          <div className="space-y-6 mb-10">
            {PARTNER_CONTRACT_SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-black mb-2" style={{ color: "#253866" }}>
                  {section.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          <div
            className="rounded-2xl p-6 mb-8"
            style={{ backgroundColor: "rgba(0,178,149,0.06)", border: "1px solid rgba(0,178,149,0.2)" }}
          >
            <h3 className="font-black text-sm mb-3" style={{ color: "#253866" }}>
              Regole automatiche caricamento prodotti
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {PARTNER_PRODUCT_RULES_SUMMARY.map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Questo documento ha valore informativo e contrattuale nel processo di onboarding.
            Per clausole specifiche (provvigioni, penali, SLA) integrare allegati concordati con Buy All Free LTD.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/produttori`}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: "#00b295" }}
            >
              Candidati come Partner
            </Link>
            <PrintButton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
