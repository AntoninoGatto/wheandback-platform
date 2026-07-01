"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Cashback",
    questions: [
      {
        q: "Come funziona il cashback?",
        a: "Il cashback è una percentuale (dal 5% al 35%) del prezzo del prodotto che ti viene accreditata come credito interno. La percentuale esatta varia in base al margine commerciale del singolo prodotto.",
      },
      {
        q: "Quando viene accreditato il cashback?",
        a: "Il cashback appare prima come 'sospeso'. Viene accreditato definitivamente solo dopo che il prodotto è stato consegnato E sono trascorsi i 14 giorni del diritto di recesso (o dopo una tua rinuncia esplicita al recesso).",
      },
      {
        q: "Posso prelevare il cashback in denaro?",
        a: "No. Il saldo cashback è esclusivamente credito interno utilizzabile per nuovi acquisti su Whe&Back®. I fondi restano sempre sul conto corrente di Buy All Free LTD e non vengono mai trasferiti in contanti.",
      },
      {
        q: "Il cashback scade?",
        a: "Il saldo accreditato non ha una scadenza automatica. Tuttavia, in caso di sospensione dell'account per violazione dei Termini e Condizioni, il saldo potrebbe essere annullato.",
      },
    ],
  },
  {
    category: "Referral",
    questions: [
      {
        q: "Come funziona il sistema referral?",
        a: "Ogni utente registrato riceve un link personale univoco. Quando un amico acquista usando il tuo link, ricevi automaticamente un cashback premio che si aggiunge al tuo saldo. Gli inviti sono illimitati.",
      },
      {
        q: "Cos'è il sistema multilivello?",
        a: "Il programma premia anche gli acquisti degli amici dei tuoi amici, su più livelli. I dettagli esatti dei livelli e delle percentuali sono definiti nel piano marketing attivo.",
      },
      {
        q: "Posso usare il link referral per me stesso?",
        a: "No. L'utilizzo fraudolento del proprio link referral (es. con account multipli) costituisce una violazione dei Termini e Condizioni e comporta la sospensione dell'account.",
      },
    ],
  },
  {
    category: "Ordini & Spedizioni",
    questions: [
      {
        q: "Quali sono i tempi di consegna?",
        a: "I tempi variano in base al prodotto e al venditore. Ogni scheda prodotto indica i tempi stimati di consegna. In fase di dropshipping, i tempi possono variare da 3 a 15 giorni lavorativi.",
      },
      {
        q: "Posso restituire un prodotto?",
        a: "Sì. Hai diritto al recesso entro 14 giorni dalla consegna, in conformità con il D.Lgs. 206/2005. Nota: durante il periodo di recesso, il cashback rimane 'sospeso' e viene accreditato solo alla scadenza.",
      },
      {
        q: "Come effettuo un reso?",
        a: "Accedi alla tua area personale, vai alla sezione 'I miei ordini' e seleziona 'Richiedi reso'. Il prodotto deve essere restituito nelle condizioni originali con imballo intatto.",
      },
    ],
  },
  {
    category: "Account & Sicurezza",
    questions: [
      {
        q: "I minori possono registrarsi?",
        a: "I minori non possono effettuare acquisti in autonomia. Il sito prevede sistemi di verifica dell'età, e le transazioni finanziarie da parte di utenti minorenni sono tassativamente bloccate dal sistema.",
      },
      {
        q: "Come vengono protetti i miei dati?",
        a: "I tuoi dati sono trattati in conformità con il GDPR. Raccogliamo solo i dati strettamente necessari. Puoi esercitare i tuoi diritti (accesso, rettifica, cancellazione) contattandoci. Privacy Policy generata con Iubenda.",
      },
      {
        q: "Come posso diventare venditore?",
        a: "Visita la sezione 'Produttori', compila il modulo di candidatura e accetta i termini legali di convenzionamento con Buy All Free LTD. Ogni candidatura viene valutata dal team prima dell'approvazione.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      className="w-full text-left border-b border-gray-100 last:border-0 py-4"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-bold" style={{ color: "#253866" }}>{q}</p>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#00b295" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />}
      </div>
      {open && (
        <p className="text-sm text-gray-500 mt-3 leading-relaxed text-left">{a}</p>
      )}
    </button>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black mb-2" style={{ color: "#253866" }}>
              Domande Frequenti
            </h1>
            <p className="text-gray-500 text-sm">Tutto quello che devi sapere su Whe&Back®</p>
          </div>

          {/* FAQ sections */}
          <div className="space-y-5">
            {FAQ_ITEMS.map(({ category, questions }) => (
              <div key={category} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-black mb-4" style={{ color: "#00b295" }}>
                  {category}
                </h2>
                <div>
                  {questions.map(({ q, a }) => (
                    <FAQItem key={q} q={q} a={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div
            className="mt-8 rounded-2xl p-6 text-center"
            style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
          >
            <p className="text-white font-bold mb-2">Non hai trovato la risposta?</p>
            <p className="text-white/60 text-sm mb-4">Il nostro team è disponibile per aiutarti</p>
            <a
              href="../contatti"
              className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white border border-white/30 hover:bg-white hover:text-[#253866] transition-colors"
            >
              Contattaci
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
