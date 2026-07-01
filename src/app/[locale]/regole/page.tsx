import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, AlertTriangle, Ban, CheckCircle, Users, Heart } from "lucide-react";

const RULES = [
  {
    icon: CheckCircle,
    color: "#00b295",
    title: "Utilizzo Etico del Link Referral",
    rules: [
      "Il link referral può essere condiviso liberamente con amici, familiari e conoscenti.",
      "Non è consentito pubblicare il proprio link referral su siti di coupon, cashback di terze parti, spam o annunci pubblicitari non autorizzati.",
      "L'acquirente non può utilizzare il proprio link referral per i propri acquisti. Il sistema blocca automaticamente questa operazione.",
      "Non è consentito creare account multipli per simulare reti referral false.",
    ],
  },
  {
    icon: Users,
    color: "#7c3aed",
    title: "Comportamento Corretto nella Rete",
    rules: [
      "È vietato incentivare terzi con pagamenti in denaro per ottenere iscrizioni o acquisti tramite il proprio link.",
      "La rete referral deve essere costruita su relazioni autentiche. Reti artificiali o create con dati falsi saranno rilevate e bloccate.",
      "I premi referral vengono erogati solo su acquisti completati e non rimborsati. Acquisti fittizi o restituiti non generano premi.",
      "Non è consentito compartecipare ai premi referral con gli acquistori per ottenere vantaggi scorretti.",
    ],
  },
  {
    icon: Shield,
    color: "#253866",
    title: "Integrità degli Acquisti",
    rules: [
      "Gli acquisti devono essere effettuati per utilizzo personale o come regalo. Acquisti esclusivamente finalizzati all'accumulo fraudolento di cashback sono vietati.",
      "Il cashback è credito interno non prelevabile. Qualsiasi tentativo di monetizzarlo tramite metodi non autorizzati comporta la sospensione immediata.",
      "In caso di reso, il cashback associato all'ordine viene automaticamente annullato.",
      "Segnalare prodotti o venditori in modo falso o scorretto per danneggiare la concorrenza è vietato.",
    ],
  },
  {
    icon: Heart,
    color: "#00b295",
    title: "Rispetto della Community",
    rules: [
      "Ogni utente è tenuto a comportarsi con rispetto verso gli altri utenti, venditori e il team Whe&Back®.",
      "Non è consentito diffondere informazioni false sul funzionamento della piattaforma.",
      "Le comunicazioni con il supporto devono essere civili e costruttive.",
      "Whe&Back® si riserva il diritto di rimuovere contenuti o recensioni che violino le norme di condotta.",
    ],
  },
];

const SANCTIONS = [
  { step: "1°", label: "Avviso formale", desc: "Notifica via email con descrizione della violazione rilevata." },
  { step: "2°", label: "Sospensione temporanea", desc: "Blocco temporaneo del codice referral e del cashback in sospeso." },
  { step: "3°", label: "Blocco permanente", desc: "Disabilitazione definitiva dell'account e perdita di tutti i crediti accumulati." },
];

export default async function RegolePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div
            className="rounded-2xl p-8 text-center text-white mb-10"
            style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(0,178,149,0.2)" }}>
              <Shield className="w-7 h-7" style={{ color: "#00b295" }} />
            </div>
            <h1 className="text-3xl font-black mb-3">Regole di Condotta</h1>
            <p className="text-white/70 max-w-xl mx-auto text-sm leading-relaxed">
              Whe&Back® è una piattaforma etica e solidale. Per garantire un ambiente trasparente e corretto per tutti,
              ogni utente — cliente o segnalatore — è tenuto a rispettare le seguenti regole.
            </p>
          </div>

          {/* Rules */}
          <div className="space-y-6 mb-10">
            {RULES.map(({ icon: Icon, color, title, rules }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h2 className="text-base font-black" style={{ color: "#253866" }}>{title}</h2>
                </div>
                <ul className="space-y-2">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: color }} />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Sanctions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444" }} />
              </div>
              <h2 className="text-base font-black" style={{ color: "#253866" }}>Provvedimenti in caso di Violazione</h2>
            </div>
            <div className="space-y-3">
              {SANCTIONS.map(({ step, label, desc }) => (
                <div key={step} className="flex items-start gap-4 p-4 rounded-xl"
                  style={{ backgroundColor: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: "#ef4444" }}>
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#253866" }}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal footer note */}
          <div className="rounded-2xl p-5 flex items-start gap-3"
            style={{ backgroundColor: "rgba(37,56,102,0.04)", border: "1px solid rgba(37,56,102,0.1)" }}>
            <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#253866" }} />
            <p className="text-xs text-gray-500 leading-relaxed">
              Le presenti Regole di Condotta fanno parte integrante dei Termini e Condizioni di utilizzo di Whe&Back®,
              gestita da <strong style={{ color: "#253866" }}>Buy All Free LTD</strong> — Foro competente: Milano — Diritto Italiano applicabile.
              L&apos;accettazione delle regole è condizione necessaria per l&apos;utilizzo della piattaforma.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
