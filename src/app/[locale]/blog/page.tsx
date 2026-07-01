import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Calendar, ArrowRight, Tag } from "lucide-react";

const MOCK_POSTS = [
  {
    slug: "commercio-etico-futuro",
    title: "Il Commercio Etico è il Futuro: Come Whe&Back® sta Cambiando le Regole",
    excerpt: "Un'analisi del modello di business sostenibile che mette al centro il cliente, il pianeta e la comunità.",
    date: "12 Giugno 2026",
    category: "Commercio Etico",
    readTime: "5 min",
  },
  {
    slug: "donazione-maggio-2026",
    title: "Aggiornamento Beneficenza: Donazione di Maggio 2026 a Il Segreto di Aladino",
    excerpt: "Trasparenza totale: ecco il report completo della donazione del mese di Maggio con documentazione del bonifico.",
    date: "3 Giugno 2026",
    category: "Beneficenza",
    readTime: "3 min",
  },
  {
    slug: "cashback-come-funziona",
    title: "Guida Completa al Cashback: Dal 5% al 35% su Ogni Acquisto",
    excerpt: "Tutto quello che devi sapere sul sistema cashback di Whe&Back®: come si calcola, quando viene accreditato e come usarlo.",
    date: "28 Maggio 2026",
    category: "Guide",
    readTime: "7 min",
  },
  {
    slug: "referral-multilivello",
    title: "Sistema Referral Multilivello: Invita Amici e Guadagna Insieme",
    excerpt: "Scopri come funziona il programma referral di Whe&Back® e perché è una delle funzionalità più potenti della piattaforma.",
    date: "20 Maggio 2026",
    category: "Referral",
    readTime: "4 min",
  },
  {
    slug: "nuovi-prodotti-maggio",
    title: "Nuovi Prodotti in Arrivo: Le Categorie che Stiamo Espandendo",
    excerpt: "Dal largo consumo agli articoli per animali, scopri i nuovi prodotti aggiunti al marketplace con cashback fino al 35%.",
    date: "15 Maggio 2026",
    category: "Marketplace",
    readTime: "3 min",
  },
  {
    slug: "whe-back-coin-roadmap",
    title: "Whe&Back Coin: La Roadmap del Nostro Token Digitale",
    excerpt: "Una panoramica sul futuro del token Whe&Back Coin, supportato da asset reali, e le fasi del progetto di tokenizzazione.",
    date: "8 Maggio 2026",
    category: "Innovazione",
    readTime: "6 min",
  },
];

const categoryColors: Record<string, string> = {
  "Commercio Etico": "#00b295",
  "Beneficenza": "#e11d48",
  "Guide": "#253866",
  "Referral": "#7c3aed",
  "Marketplace": "#d97706",
  "Innovazione": "#0891b2",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black mb-2" style={{ color: "#253866" }}>Blog</h1>
            <p className="text-gray-500 text-sm">
              Approfondimenti su commercio etico, aggiornamenti donazioni e novità del marketplace
            </p>
          </div>

          {/* Featured post */}
          <div
            className="rounded-2xl p-8 text-white mb-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #253866 0%, #1a2a4d 100%)" }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
              style={{ backgroundColor: "#00b295" }}
            />
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ backgroundColor: "rgba(0,178,149,0.2)", color: "#00b295" }}
            >
              {MOCK_POSTS[0].category}
            </span>
            <h2 className="text-2xl font-black mb-3 relative">{MOCK_POSTS[0].title}</h2>
            <p className="text-white/60 text-sm mb-6 relative max-w-xl">{MOCK_POSTS[0].excerpt}</p>
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3 text-white/40 text-xs">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{MOCK_POSTS[0].date}</span>
                <span>{MOCK_POSTS[0].readTime} di lettura</span>
              </div>
              <Link
                href={`blog/${MOCK_POSTS[0].slug}`}
                className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-80"
                style={{ color: "#00b295" }}
              >
                Leggi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_POSTS.slice(1).map((post) => (
              <Link
                key={post.slug}
                href={`blog/${post.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${categoryColors[post.category] || "#253866"}18`,
                      color: categoryColors[post.category] || "#253866",
                    }}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h3
                  className="font-black text-sm mb-2 line-clamp-2 group-hover:text-[#00b295] transition-colors"
                  style={{ color: "#253866" }}
                >
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
                <div className="flex items-center gap-1 mt-4 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
