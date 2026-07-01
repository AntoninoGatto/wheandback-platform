import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CheckCircle, XCircle, Ban } from "lucide-react";

async function approveProduct(productId: string, locale: string) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("products").update({
    status: "published",
    approved_by: user!.id,
    approved_at: new Date().toISOString(),
  }).eq("id", productId);
  revalidatePath(`/${locale}/admin/prodotti`);
}

async function rejectProduct(productId: string, locale: string) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  await supabase.from("products").update({ status: "rejected" }).eq("id", productId);
  revalidatePath(`/${locale}/admin/prodotti`);
}

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, cashback_percent, status, category_id, seller_id, created_at")
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
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Gestione Prodotti</h1>
        <p className="text-gray-400 text-sm mt-1">{products?.length ?? 0} prodotti nel sistema</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {!products || products.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">Nessun prodotto ancora nel sistema.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Prodotto</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Prezzo</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Cashback</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Stato</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const s = statusLabel[product.status] ?? statusLabel.draft;
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold" style={{ color: "#253866" }}>{product.name}</td>
                    <td className="px-6 py-4 text-gray-600">€{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "#00b295" }}>{product.cashback_percent}%</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.status === "pending_approval" && (
                        <div className="flex items-center gap-2">
                          <form action={approveProduct.bind(null, product.id, locale)}>
                            <button type="submit"
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80"
                              style={{ backgroundColor: "#00b295" }}>
                              <CheckCircle className="w-3 h-3" /> Approva
                            </button>
                          </form>
                          <form action={rejectProduct.bind(null, product.id, locale)}>
                            <button type="submit"
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80"
                              style={{ backgroundColor: "#ef4444" }}>
                              <XCircle className="w-3 h-3" /> Rifiuta
                            </button>
                          </form>
                        </div>
                      )}
                      {product.status === "blacklisted" && (
                        <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                          <Ban className="w-3 h-3" /> Bloccato automaticamente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
