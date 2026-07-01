import { createClient } from "@/lib/supabase/server";
import { Users, Package, Store, TrendingUp, Clock, AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalProducts },
    { count: pendingProducts },
    { count: totalSellers },
    { count: pendingSellers },
    { count: flaggedCashback },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "pending_approval"),
    supabase.from("seller_profiles").select("*", { count: "exact", head: true }),
    supabase.from("seller_profiles").select("*", { count: "exact", head: true }).is("approved_at", null),
    supabase.from("cashback_transactions").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { icon: Users, label: "Utenti Registrati", value: totalUsers ?? 0, color: "#253866" },
    { icon: Package, label: "Prodotti Totali", value: totalProducts ?? 0, color: "#00b295" },
    { icon: Clock, label: "Prodotti in Revisione", value: pendingProducts ?? 0, color: "#f59e0b", alert: (pendingProducts ?? 0) > 0 },
    { icon: Store, label: "Venditori", value: totalSellers ?? 0, color: "#7c3aed" },
    { icon: AlertTriangle, label: "Venditori in Attesa", value: pendingSellers ?? 0, color: "#ef4444", alert: (pendingSellers ?? 0) > 0 },
    { icon: TrendingUp, label: "Cashback in Sospeso", value: flaggedCashback ?? 0, color: "#0891b2" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Pannello di Controllo</h1>
        <p className="text-gray-400 text-sm mt-1">Whe&Back® — Riservato ad Antonino Gatto e team autorizzato</p>
      </div>

      {/* Alert banners */}
      {(pendingProducts ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-4 text-sm font-semibold"
          style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#d97706" }}>
          <Clock className="w-4 h-4" />
          {pendingProducts} prodotto/i in attesa di approvazione
        </div>
      )}
      {(pendingSellers ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-semibold"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
          <AlertTriangle className="w-4 h-4" />
          {pendingSellers} venditore/i in attesa di approvazione
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, color, alert }) => (
          <div key={label}
            className="bg-white rounded-2xl border p-5 transition-shadow hover:shadow-md"
            style={{ borderColor: alert ? color : "#f1f5f9" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-gray-500">{label}</span>
            </div>
            <p className="text-3xl font-black" style={{ color: alert ? color : "#253866" }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
