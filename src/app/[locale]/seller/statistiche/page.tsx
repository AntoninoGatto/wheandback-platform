import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Package, ShoppingBag, Euro } from "lucide-react";

export default async function SellerStatistichePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user!.id);

  const { count: publishedProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user!.id)
    .eq("status", "published");

  // Orders for seller's products
  const { data: sellerProducts } = await supabase
    .from("products")
    .select("id, name, price, cashback_percent")
    .eq("seller_id", user!.id);

  const productIds = sellerProducts?.map((p) => p.id) ?? [];

  let totalOrders = 0;
  let totalRevenue = 0;
  let topProducts: { name: string; orders: number; revenue: number }[] = [];

  if (productIds.length > 0) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price")
      .in("product_id", productIds);

    if (orderItems) {
      totalOrders = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      totalRevenue = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

      const productMap: Record<string, { name: string; orders: number; revenue: number }> = {};
      orderItems.forEach((item) => {
        const product = sellerProducts?.find((p) => p.id === item.product_id);
        if (!productMap[item.product_id]) {
          productMap[item.product_id] = { name: product?.name ?? "Prodotto", orders: 0, revenue: 0 };
        }
        productMap[item.product_id].orders += item.quantity;
        productMap[item.product_id].revenue += item.unit_price * item.quantity;
      });

      topProducts = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    }
  }

  const stats = [
    { icon: Package, label: "Prodotti Totali", value: totalProducts ?? 0, format: "num", color: "#253866" },
    { icon: TrendingUp, label: "Prodotti Pubblicati", value: publishedProducts ?? 0, format: "num", color: "#00b295" },
    { icon: ShoppingBag, label: "Unità Vendute", value: totalOrders, format: "num", color: "#7c3aed" },
    { icon: Euro, label: "Fatturato Totale", value: totalRevenue, format: "eur", color: "#0891b2" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Statistiche</h1>
        <p className="text-gray-400 text-sm mt-1">Panoramica delle performance del tuo negozio</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, format, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-gray-500">{label}</span>
            </div>
            <p className="text-3xl font-black" style={{ color: "#253866" }}>
              {format === "eur" ? `€${(value as number).toFixed(2)}` : value}
            </p>
          </div>
        ))}
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-base" style={{ color: "#253866" }}>Prodotti Più Venduti</h2>
        </div>
        {topProducts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">Nessuna vendita ancora registrata.</p>
            <p className="text-gray-400 text-xs mt-1">Le statistiche appariranno qui dopo i primi ordini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <div key={p.name} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : "#cd7c2f" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "#253866" }}>{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black" style={{ color: "#00b295" }}>€{p.revenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{p.orders} unità</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
