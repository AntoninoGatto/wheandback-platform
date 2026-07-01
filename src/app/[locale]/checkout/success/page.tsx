import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center shadow-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "#00b295" }} />
          </div>

          <h1 className="text-2xl font-black mb-2" style={{ color: "#253866" }}>
            Ordine Confermato!
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Il tuo acquisto è andato a buon fine. Il cashback sarà accreditato dopo la consegna e i 14 giorni di recesso.
          </p>

          <div
            className="rounded-xl p-4 mb-6 text-left"
            style={{ backgroundColor: "rgba(0,178,149,0.06)", border: "1px solid rgba(0,178,149,0.2)" }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: "#253866" }}>Il tuo cashback</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Apparirà come &quot;In Attesa&quot; nella tua area personale. Sarà accreditato automaticamente a fine periodo di recesso.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/${locale}/dashboard`}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#00b295" }}
            >
              Vai alla Dashboard
            </Link>
            <Link
              href={`/${locale}/shop`}
              className="w-full py-3 rounded-xl font-bold text-sm border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: "#253866", color: "#253866" }}
            >
              Continua lo Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
