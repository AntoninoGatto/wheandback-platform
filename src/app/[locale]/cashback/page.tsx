import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CashbackPageClient from "@/components/cashback/CashbackPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function CashbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let creditedBalance = 0;
  let pendingBalance = 0;
  let history: { id: string; created_at: string; product_name: string | null; amount: number; status: string }[] = [];

  if (user) {
    const { data: transactions } = await supabase
      .from("cashback_transactions")
      .select("id, created_at, amount, status, order_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (transactions) {
      creditedBalance = transactions
        .filter((t) => t.status === "credited")
        .reduce((sum, t) => sum + t.amount, 0);
      pendingBalance = transactions
        .filter((t) => t.status === "pending")
        .reduce((sum, t) => sum + t.amount, 0);
      history = transactions.map((t) => ({
        id: t.id,
        created_at: t.created_at,
        product_name: null,
        amount: t.amount,
        status: t.status,
      }));
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <CashbackPageClient
          creditedBalance={creditedBalance}
          pendingBalance={pendingBalance}
          history={history}
        />
      </main>
      <Footer />
    </div>
  );
}
