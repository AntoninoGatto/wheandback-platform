import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, cashback_percent, status, stock, category_id")
    .eq("seller_id", user!.id)
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    published:        { label: "Pubblicato",   color: "#00b295", bg: "rgba(0,178,149,0.1)" },
    pending_approval: { label: "In Revisione", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    draft:            { label: "Bozza",         color: "#64748b", bg: "rgba(100,116,139,0.1)" },
    rejected:         { label: "Rifiutato",     color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    blacklisted:      { label: "Bloccato",      color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#253866" }}>I Miei Prodotti</h1>
          <p className="text-gray-400 text-sm mt-1">{products?.length ?? 0} prodotti nel tuo catalogo</p>
        </div>
        <Link
          href={`/${locale}/seller/prodotti/nuovo`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#00b295" }}
        >
          <PlusCircle className="w-4 h-4" />
          Nuovo Prodotto
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400 text-sm mb-4">Non hai ancora caricato nessun prodotto.</p>
          <Link
            href={`/${locale}/seller/prodotti/nuovo`}
            className="inline-block px-5 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ backgroundColor: "#00b295" }}
          >
            + Aggiungi il primo prodotto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Prodotto</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Prezzo</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Cashback</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Stato</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const s = statusLabel[product.status] ?? statusLabel.draft;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold" style={{ color: "#253866" }}>{product.name}</td>
                    <td className="px-6 py-4 text-gray-600">€{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "#00b295" }}>{product.cashback_percent}%</td>
                    <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/${locale}/seller/prodotti/${product.id}/modifica`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                        <Pencil className="w-3 h-3" /> Modifica
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
