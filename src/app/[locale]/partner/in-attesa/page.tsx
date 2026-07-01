import Link from "next/link";
import { Clock, FileText, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { PARTNER_CONTRACT } from "@/constants/partner-contract";
import { redirect } from "next/navigation";

export default async function PartnerPendingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { createAdminClient } = await import("@/lib/supabase/server");
  const admin = await createAdminClient();
  const { data: seller } = await admin
    .from("seller_profiles")
    .select(
      "company_name, is_active, approved_at, contract_signed_received_at"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (seller?.is_active && seller.approved_at) {
    redirect(`/${locale}/seller`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-xl w-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: "rgba(245,158,11,0.12)" }}
          >
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: "#253866" }}>
            Candidatura in revisione
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {seller?.company_name ? (
              <>Abbiamo ricevuto la candidatura di <strong>{seller.company_name}</strong>.</>
            ) : (
              <>Abbiamo ricevuto la tua candidatura partner.</>
            )}{" "}
            Il team Whe&Back® verificherà i dati e attiverà il portale venditore.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 text-sm">
              <FileText className="w-4 h-4 mt-0.5" style={{ color: "#253866" }} />
              <div>
                <p className="font-bold" style={{ color: "#253866" }}>Contratto firmato</p>
                <p className="text-gray-500 text-xs mt-1">
                  {seller?.contract_signed_received_at
                    ? "Ricevuto dal team. Grazie!"
                    : `Invia il PDF firmato a ${PARTNER_CONTRACT.CONTRACT_EMAIL}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 text-sm">
              <Mail className="w-4 h-4 mt-0.5" style={{ color: "#253866" }} />
              <div>
                <p className="font-bold" style={{ color: "#253866" }}>Dopo l&apos;approvazione</p>
                <p className="text-gray-500 text-xs mt-1">
                  Potrai caricare prodotti autonomamente dal portale venditore.
                </p>
              </div>
            </div>
          </div>

          <Link href={`/${locale}/legal/contratto-partner`} className="text-xs font-bold underline" style={{ color: "#00b295" }}>
            Rileggi il contratto partner
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
