import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Award, Globe, Heart, Shield, Users, TrendingUp } from "lucide-react";

export default function ChiSiamoPage() {
  const values = [
    { icon: Heart, title: "Etica", desc: "Ogni prodotto e ogni scelta rispetta un codice etico rigoroso. Escludiamo categoricamente tutto ciò che non allinea con i nostri valori." },
    { icon: Shield, title: "Trasparenza", desc: "Cashback, donazioni, royalty: tutto documentato e verificabile. Nessun costo nascosto, nessuna promessa non mantenuta." },
    { icon: Globe, title: "Sostenibilità", desc: "Un modello di business che genera valore per chi compra, chi vende e la società. Il commercio può essere un motore di bene." },
    { icon: Users, title: "Comunità", desc: "Ogni acquisto rafforza la rete. Il sistema referral crea legami reali tra persone che si fidano l'una dell'altra." },
    { icon: TrendingUp, title: "Innovazione", desc: "Dall'integrazione del token Whe&Back Coin all'AI anti-frode: siamo costruiti per il futuro del commercio digitale." },
    { icon: Award, title: "Qualità", desc: "Solo prodotti selezionati, solo partner verificati. Il marchio Whe&Back® è sinonimo di standard elevati." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }} className="py-20 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-1 text-4xl font-black mb-4">
              <span>whe</span>
              <span style={{ color: "#00b295" }}>&</span>
              <span>back</span>
              <sup className="text-base ml-1">®</sup>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
              Chi Siamo
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Whe&Back® è il marchio commerciale gestito da <strong className="text-white">Buy All Free LTD</strong>,
              società attiva da oltre 4 anni sotto la visione etica del titolare{" "}
              <strong className="text-white">Antonino Gatto</strong>.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-black mb-5" style={{ color: "#253866" }}>La Nostra Storia</h2>
                <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                  <p>
                    Whe&Back® nasce da una visione semplice ma rivoluzionaria: il commercio può essere
                    un atto etico. Ogni acquisto può generare valore non solo per chi compra e chi vende,
                    ma per l&apos;intera comunità.
                  </p>
                  <p>
                    <strong style={{ color: "#253866" }}>Buy All Free LTD</strong> (Company Number:
                    13803002), con sede nel Regno Unito, gestisce la piattaforma rispettando il diritto
                    italiano, con foro competente esclusivo a Milano.
                  </p>
                  <p>
                    Il sistema di cashback dal 5% al 35%, il referral multilivello e la donazione mensile
                    dell&apos;1% del fatturato all&apos;Associazione &ldquo;Il Segreto di Aladino&rdquo;
                    non sono semplici funzionalità: sono il cuore pulsante di un progetto che vuole
                    dimostrare che la vita è davvero un cerchio.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Anni di Attività", value: "4+" },
                  { label: "Lingue Supportate", value: "5" },
                  { label: "Cashback Massimo", value: "35%" },
                  { label: "Donazione Mensile", value: "1%" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                    <p className="text-3xl font-black w-20 text-center flex-shrink-0" style={{ color: "#00b295" }}>
                      {value}
                    </p>
                    <p className="font-semibold text-sm" style={{ color: "#253866" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-center mb-10" style={{ color: "#253866" }}>
              I Nostri Valori
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#00b295" }} />
                  </div>
                  <h3 className="font-black mb-2 text-sm" style={{ color: "#253866" }}>{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Legal info */}
        <section className="py-10 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black mb-4 text-sm" style={{ color: "#253866" }}>Dati Societari</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
                <p><strong>Ragione Sociale:</strong> Buy All Free LTD</p>
                <p><strong>Company Number:</strong> 13803002</p>
                <p><strong>Marchio:</strong> Whe&Back® (Proprietà Intellettuale: Antonino Gatto)</p>
                <p><strong>Foro Competente:</strong> Tribunale di Milano</p>
                <p><strong>Legge Applicabile:</strong> Diritto Italiano</p>
                <p><strong>Privacy:</strong> In collaborazione con Iubenda</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
