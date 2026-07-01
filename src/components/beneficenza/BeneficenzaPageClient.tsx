"use client";

import { Heart, FileText, CheckCircle } from "lucide-react";

interface Report {
  id: string;
  report_month: string;
  total_revenue: number | null;
  charity_amount: number | null;
  paid_at: string | null;
}

interface BeneficenzaPageClientProps {
  reports: Report[];
  totalDonated: number;
  monthsCount: number;
}

export default function BeneficenzaPageClient({
  reports,
  totalDonated,
  monthsCount,
}: BeneficenzaPageClientProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div
        className="rounded-2xl p-8 md:p-12 text-center text-white mb-10"
        style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "rgba(0,178,149,0.2)" }}
        >
          <Heart className="w-8 h-8" style={{ color: "#00b295" }} />
        </div>
        <h1 className="text-3xl font-black mb-3">Beneficenza & Trasparenza</h1>
        <p className="text-white/70 max-w-xl mx-auto text-sm leading-relaxed">
          Ogni mese, <strong className="text-white">Buy All Free LTD</strong> devolve l&apos;1% del
          fatturato totale all&apos;Associazione{" "}
          <strong style={{ color: "#00b295" }}>&ldquo;Il Segreto di Aladino&rdquo;</strong>.
          Qui puoi verificare ogni singolo bonifico effettuato.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { label: "Totale Donato", value: `€${totalDonated.toLocaleString("it-IT", { minimumFractionDigits: 2 })}` },
            { label: "Mesi Rendicontati", value: monthsCount.toString() },
            { label: "% sul Fatturato", value: "1%" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-black" style={{ color: "#00b295" }}>{value}</p>
              <p className="text-white/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What is the association */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-black mb-4" style={{ color: "#253866" }}>
          Chi è &ldquo;Il Segreto di Aladino&rdquo;
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          L&apos;Associazione &ldquo;Il Segreto di Aladino&rdquo; è il beneficiario ufficiale delle
          donazioni mensili di Whe&Back®. Ogni bonifico viene documentato ufficialmente e reso
          disponibile in questa pagina per garantire la massima trasparenza verso i nostri clienti
          e partner.
        </p>
        <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: "#00b295" }}>
          <CheckCircle className="w-4 h-4" />
          <span className="font-semibold">Impegno contrattuale di Buy All Free LTD verificabile</span>
        </div>
      </div>

      {/* Reports table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-black" style={{ color: "#253866" }}>
            Report Mensili
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Documentazione ufficiale dei bonifici effettuati
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Heart className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">Nessun report disponibile ancora.</p>
            <p className="text-gray-400 text-xs mt-1">Il primo report apparirà a fine mese.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map((report) => (
              <div key={report.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
                  >
                    <FileText className="w-5 h-5" style={{ color: "#00b295" }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#253866" }}>
                      {new Date(report.report_month).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-gray-400">
                      Fatturato: €{(report.total_revenue ?? 0).toLocaleString("it-IT", { minimumFractionDigits: 2 })} ·
                      Donazione: €{(report.charity_amount ?? 0).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </p>
                    {report.paid_at && (
                      <p className="text-xs text-gray-400">
                        Bonifico del {new Date(report.paid_at).toLocaleDateString("it-IT")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {report.paid_at && (
                    <span
                      className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(0,178,149,0.1)", color: "#00b295" }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Verificato
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal note */}
      <p className="text-xs text-gray-400 text-center mt-6">
        Le donazioni sono regolate dal contratto stipulato tra Antonino Gatto (Licenziante) e
        Buy All Free LTD (Licenziataria) — Foro competente: Milano — Diritto Italiano
      </p>
    </div>
  );
}
