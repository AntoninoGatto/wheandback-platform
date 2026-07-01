import { createClient } from "@/lib/supabase/server";
import { Package, TrendingUp, Eye, Clock } from "lucide-react";
import Link from "next/link";

export default async function SellerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, status, price, cashback_percent")
    .eq("seller_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user!.id);

  const { count: publishedProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user!.id)
    .eq("status", "published");

  const { count: pendingProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user!.id)
    .eq("status", "pending_approval");

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    published:        { label: "Pubblicato",     color: "#00b295", bg: "rgba(0,178,149,0.1)" },
    pending_approval: { label: "In Revisione",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    draft:            { label: "Bozza",           color: "#64748b", bg: "rgba(100,116,139,0.1)" },
    rejected:         { label: "Rifiutato",       color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    blacklisted:      { label: "Bloccato",        color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Panoramica</h1>
        <p className="text-gray-400 text-sm mt-1">Gestisci i tuoi prodotti su Whe&Back®</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Package, label: "Prodotti Totali", value: totalProducts ?? 0, color: "#253866" },
          { icon: Eye, label: "Pubblicati", value: publishedProducts ?? 0, color: "#00b295" },
          { icon: Clock, label: "In Revisione", value: pendingProducts ?? 0, color: "#f59e0b" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-gray-500">{label}</span>
            </div>
            <p className="text-3xl font-black" style={{ color: "#253866" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent products */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-base" style={{ color: "#253866" }}>Prodotti Recenti</h2>
          <Link href={`/${locale}/seller/prodotti`} className="text-xs font-semibold" style={{ color: "#00b295" }}>
            Vedi tutti →
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm mb-4">Nessun prodotto ancora caricato</p>
            <Link
              href={`/${locale}/seller/prodotti/nuovo`}
              className="inline-block px-5 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ backgroundColor: "#00b295" }}
            >
              + Aggiungi il primo prodotto
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {products.map((product) => {
              const s = statusLabel[product.status] ?? statusLabel.draft;
              return (
                <div key={product.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#253866" }}>{product.name}</p>
                    <p className="text-xs text-gray-400">€{product.price.toFixed(2)} · Cashback {product.cashback_percent}%</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
