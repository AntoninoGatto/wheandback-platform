import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Users, Heart, Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export default async function PianoMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const supabase = await createClient();

  // Fetch active marketing plan from DB (fallback to default values)
  const { data: plan } = await supabase
    .from("marketing_plans")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cashbackMin = plan?.cashback_min ?? 5;
  const cashbackMax = plan?.cashback_max ?? 35;
  const referralL1 = plan?.referral_level1 ?? 5;
  const referralL2 = plan?.referral_level2 ?? 2;
  const referralL3 = plan?.referral_level3 ?? 1;
  const charityPercent = 1;
  const lastUpdated = plan?.updated_at
    ? new Date(plan.updated_at).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
    : "In attesa di configurazione";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div className="mb-10 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ backgroundColor: "rgba(0,178,149,0.1)", color: "#00b295" }}>
              Aggiornato il {lastUpdated}
            </span>
            <h1 className="text-3xl font-black mb-3" style={{ color: "#253866" }}>Piano Marketing Attivo</h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Queste sono le percentuali cashback e referral attualmente in vigore su Whe&Back®.
              Il piano può variare mensilmente — controlla questa pagina per restare aggiornato.
            </p>
          </div>

          {/* Cashback section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(0,178,149,0.1)" }}>
                <TrendingUp className="w-5 h-5" style={{ color: "#00b295" }} />
              </div>
              <h2 className="text-lg font-black" style={{ color: "#253866" }}>Cashback per gli Acquirenti</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "rgba(0,178,149,0.06)" }}>
                <p className="text-3xl font-black" style={{ color: "#00b295" }}>{cashbackMin}%</p>
                <p className="text-xs text-gray-500 mt-1">Cashback Minimo</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "rgba(37,56,102,0.06)" }}>
                <p className="text-3xl font-black" style={{ color: "#253866" }}>{cashbackMax}%</p>
                <p className="text-xs text-gray-500 mt-1">Cashback Massimo</p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#00b295" }} />Calcolato automaticamente sul prezzo del prodotto</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#00b295" }} />Accreditato dopo consegna + 14 giorni di recesso (D.Lgs. 206/2005)</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#00b295" }} />Utilizzabile solo come credito per nuovi acquisti su Whe&Back® — non è prelevabile in contanti</li>
            </ul>
          </div>

          {/* Referral section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(124,58,237,0.1)" }}>
                <Users className="w-5 h-5" style={{ color: "#7c3aed" }} />
              </div>
              <h2 className="text-lg font-black" style={{ color: "#253866" }}>Sistema Referral Multilivello</h2>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { level: 1, label: "Livello 1 — Amici Diretti", percent: referralL1, desc: "Chi porta nuovi acquirenti tramite il proprio link" },
                { level: 2, label: "Livello 2 — Rete Secondaria", percent: referralL2, desc: "Sugli acquisti degli amici dei tuoi amici" },
                { level: 3, label: "Livello 3 — Rete Estesa", percent: referralL3, desc: "Sugli acquisti del terzo livello di rete" },
              ].map(({ level, label, percent, desc }) => (
                <div key={level} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "rgba(124,58,237,0.04)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ backgroundColor: "#7c3aed" }}>
                      {level}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#253866" }}>{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <p className="text-xl font-black flex-shrink-0" style={{ color: "#7c3aed" }}>{percent}%</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 text-xs text-gray-500"
              style={{ backgroundColor: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <strong style={{ color: "#dc2626" }}>Regola anti-frode:</strong> L&apos;acquirente non può utilizzare il proprio link referral. Se nessun segnalatore è presente, il link referral della piattaforma viene applicato automaticamente.
            </div>
          </div>

          {/* Charity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(0,178,149,0.1)" }}>
                <Heart className="w-5 h-5" style={{ color: "#00b295" }} />
              </div>
              <h2 className="text-lg font-black" style={{ color: "#253866" }}>Donazione Mensile — {charityPercent}%</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              L&apos;{charityPercent}% del fatturato netto mensile viene devoluto ogni mese all&apos;Associazione{" "}
              <strong style={{ color: "#253866" }}>&ldquo;Il Segreto di Aladino&rdquo;</strong>.
              Ogni bonifico è documentato e pubblicato nella pagina Beneficenza.
            </p>
          </div>

          {/* Margin rule */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(37,56,102,0.08)" }}>
                <Shield className="w-5 h-5" style={{ color: "#253866" }} />
              </div>
              <h2 className="text-lg font-black" style={{ color: "#253866" }}>Regola di Margine per i Venditori</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              Ogni prodotto su Whe&Back® deve rispettare la seguente struttura di margine per garantire la sostenibilità del sistema:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              {[
                { label: "Prezzo Acquisto", value: "≤ 50%", color: "#253866", desc: "del prezzo vendita" },
                { label: "Cashback Clienti", value: "fino a 35%", color: "#00b295", desc: "del prezzo vendita" },
                { label: "Beneficenza", value: "1%", color: "#7c3aed", desc: "del fatturato netto" },
                { label: "Margine Aziendale", value: "≥ 14%", color: "#0891b2", desc: "utile + crescita" },
              ].map(({ label, value, color, desc }) => (
                <div key={label} className="p-3 rounded-xl border border-gray-100">
                  <p className="text-lg font-black" style={{ color }}>{value}</p>
                  <p className="font-semibold text-gray-600 mt-0.5">{label}</p>
                  <p className="text-gray-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Update notice */}
          <div className="rounded-2xl p-5 flex items-start gap-3"
            style={{ backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <RefreshCw className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong style={{ color: "#253866" }}>Il Piano Marketing può essere aggiornato</strong> dal team Whe&Back® in qualsiasi momento, anche giornalmente. Le modifiche si applicano ai nuovi acquisti dalla data di aggiornamento. Controlla regolarmente questa pagina per restare informato sulle percentuali attive.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
