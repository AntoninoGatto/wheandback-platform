import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BeneficenzaPageClient from "@/components/beneficenza/BeneficenzaPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function BeneficenzaPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("royalty_reports")
    .select("id, report_month, total_revenue, charity_amount, paid_at")
    .order("report_month", { ascending: false });

  const totalDonated = reports?.reduce((sum, r) => sum + (r.charity_amount ?? 0), 0) ?? 0;
  const monthsCount = reports?.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <BeneficenzaPageClient
          reports={reports ?? []}
          totalDonated={totalDonated}
          monthsCount={monthsCount}
        />
      </main>
      <Footer />
    </div>
  );
}
