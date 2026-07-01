"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Store, Shield, TrendingUp, Users, CheckCircle, Send, ChevronRight, AlertTriangle } from "lucide-react";
import { submitSellerApplication } from "@/lib/seller/actions";
import { PARTNER_CONTRACT } from "@/constants/partner-contract";

const BENEFITS = [
  { icon: TrendingUp, title: "Accesso a una Rete Crescente", desc: "Raggiungi migliaia di clienti attivi che acquistano grazie al sistema cashback più vantaggioso del mercato." },
  { icon: Shield, title: "Pagamenti Garantiti", desc: "Buy All Free LTD garantisce i pagamenti ai venditori convenzionati secondo i termini contrattuali concordati." },
  { icon: Users, title: "Supporto Dedicato", desc: "Un team commerciale dedicato ti affianca dall'onboarding alla gestione quotidina del tuo catalogo." },
  { icon: Store, title: "Gestione Autonoma", desc: "Una volta approvato, puoi caricare e gestire i tuoi prodotti in autonomia nel tuo spazio sicuro." },
];

const STEPS = [
  { n: "01", title: "Compila la Candidatura", desc: "Inserisci i dati della tua azienda e il tipo di prodotti che vuoi vendere." },
  { n: "02", title: "Accetta i Termini Legali", desc: "Firma digitalmente le condizioni di convenzionamento con Buy All Free LTD." },
  { n: "03", title: "Attendi l'Approvazione", desc: "Il team verifica la candidatura e valida il tuo account (entro 5 giorni lavorativi)." },
  { n: "04", title: "Inizia a Vendere", desc: "Accedi al portale venditore e carica i tuoi prodotti nel marketplace." },
];

export default function ProduttoriPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    company: "", vat: "", name: "", email: "", phone: "", categories: "", description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !contractAccepted) return;
    setError("");

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.set(k, v));
    fd.set("agreed", "true");
    fd.set("contract_accepted", "true");

    startTransition(async () => {
      const result = await submitSellerApplication(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }} className="py-20 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5"
                style={{ backgroundColor: "rgba(0,178,149,0.2)", color: "#00b295" }}
              >
                Area Partner B2B
              </span>
              <h1 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
                Vendi su Whe&Back®.<br />
                <span style={{ color: "#00b295" }}>Cresci con noi.</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
                Accogliamo produttori e brand da Italia, Unione Europea e Stati Uniti.
                Diventa partner convenzionato di Buy All Free LTD e porta i tuoi prodotti
                davanti a una community di acquirenti motivati dal cashback.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 mb-10">
              <span className="text-2xl font-black" style={{ color: "#253866" }}>Perché Scegliere</span>
              <Image src="/logo.png" alt="Whe&Back®" width={120} height={34} className="h-8 w-auto" />
              <sup className="text-sm font-bold -ml-1 -mt-3" style={{ color: "#253866" }}>®</sup>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-5 rounded-2xl border border-gray-100">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#00b295" }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1" style={{ color: "#253866" }}>{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black mb-10 text-center" style={{ color: "#253866" }}>
              Come Diventare Partner
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-black text-sm"
                    style={{ backgroundColor: "#253866" }}
                  >
                    {n}
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: "#253866" }}>{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black mb-2 text-center" style={{ color: "#253866" }}>
              Candidati come Partner
            </h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Compila il modulo e ti contatteremo entro 5 giorni lavorativi
            </p>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "rgba(0,178,149,0.1)" }}>
                  <CheckCircle className="w-8 h-8" style={{ color: "#00b295" }} />
                </div>
                <h3 className="text-xl font-black mb-2" style={{ color: "#253866" }}>Candidatura Inviata!</h3>
                <p className="text-gray-500 text-sm">
                  Il team di Whe&Back® ti contatterà entro 5 giorni lavorativi.
                  Invia il contratto firmato a {PARTNER_CONTRACT.CONTRACT_EMAIL}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 p-4 rounded-xl text-sm"
                    style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "company", label: "Ragione Sociale *", placeholder: "La tua azienda", type: "text" },
                    { key: "vat", label: "Partita IVA / VAT", placeholder: "IT12345678901", type: "text" },
                    { key: "name", label: "Referente *", placeholder: "Nome e Cognome", type: "text" },
                    { key: "email", label: "Email *", placeholder: "info@tuaazienda.it", type: "email" },
                    { key: "phone", label: "Telefono", placeholder: "+39 000 0000000", type: "tel" },
                    { key: "categories", label: "Categorie Prodotti *", placeholder: "Es. Casa, Elettronica...", type: "text" },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>{label}</label>
                      <input
                        type={type}
                        required={label.includes("*")}
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                    Descrizione Attività *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrivi brevemente la tua attività e i prodotti che vorresti vendere..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] resize-none"
                  />
                </div>

                {/* Contract acceptance */}
                <div className="rounded-xl p-4 border border-gray-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contractAccepted}
                      onChange={(e) => setContractAccepted(e.target.checked)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      Accetto il{" "}
                      <a href={`/${locale}/legal/contratto-partner`} target="_blank" rel="noreferrer" className="underline font-semibold" style={{ color: "#253866" }}>
                        Contratto di Convenzionamento Partner
                      </a>{" "}
                      (v.{PARTNER_CONTRACT.VERSION}) e invierò copia firmata a {PARTNER_CONTRACT.CONTRACT_EMAIL}. *
                    </span>
                  </label>
                </div>

                {/* Legal acceptance */}
                <div
                  className="rounded-xl p-4 border"
                  style={{ borderColor: agreed ? "#00b295" : "#e2e8f0", backgroundColor: agreed ? "rgba(0,178,149,0.05)" : "white" }}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      Dichiaro di aver letto e di accettare integralmente i{" "}
                      <strong style={{ color: "#253866" }}>Termini e Condizioni di Convenzionamento</strong>{" "}
                      con Buy All Free LTD, e comprendo che l&apos;accesso operativo al portale è subordinato
                      alla validazione dell&apos;account da parte del team Whe&Back®. *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agreed || !contractAccepted || isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#00b295" }}
                >
                  {isPending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />}
                  {isPending ? "Invio in corso..." : "Invia Candidatura"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
