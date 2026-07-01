import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:text-[#00b295]"
            style={{ color: "#253866" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al Blog
          </Link>

          <article className="bg-white rounded-2xl border border-gray-100 p-8">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ backgroundColor: "rgba(0,178,149,0.1)", color: "#00b295" }}
            >
              Articolo
            </span>
            <h1 className="text-2xl md:text-3xl font-black mb-4 leading-tight" style={{ color: "#253866" }}>
              {slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
              <Calendar className="w-3 h-3" />
              <span>Giugno 2026</span>
              <span>·</span>
              <span>5 min di lettura</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
              <p>
                Questo articolo è in fase di redazione. Il contenuto completo sarà disponibile
                presto nella piattaforma Whe&Back®.
              </p>
              <p>
                Nel frattempo, visita la nostra <Link href={`/${locale}/faq`} style={{ color: "#00b295" }}>sezione FAQ</Link> per
                trovare risposta alle domande più frequenti, oppure{" "}
                <Link href={`/${locale}/contatti`} style={{ color: "#00b295" }}>contattaci</Link> direttamente.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
