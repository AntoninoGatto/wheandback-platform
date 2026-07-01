import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle, Package } from "lucide-react";

export default async function ImportLogPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("import_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const statusStyle: Record<string, { color: string; bg: string; label: string }> = {
    auto_approved: { color: "#00b295", bg: "rgba(0,178,149,0.1)", label: "Pubblicato" },
    imported:      { color: "#253866", bg: "rgba(37,56,102,0.08)", label: "Importato" },
    failed:        { color: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "Errore" },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Log Importazioni</h1>
        <p className="text-gray-400 text-sm mt-1">Storico di tutti i prodotti importati da CJ Dropshipping</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {!logs || logs.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">Nessuna importazione ancora effettuata.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Prodotto</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Fornitore</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Acquisto</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Vendita</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">CB%</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Stato</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => {
                const s = statusStyle[log.status] ?? statusStyle.imported;
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold" style={{ color: "#253866" }}>{log.product_name}</p>
                      <p className="text-xs text-gray-400">CJ: {log.cj_product_id}</p>
                      {log.error_message && <p className="text-xs text-red-400 mt-0.5">{log.error_message}</p>}
                    </td>
                    <td className="px-6 py-4 text-xs uppercase font-bold text-gray-400">{log.supplier}</td>
                    <td className="px-6 py-4 text-gray-600">€{log.purchase_price?.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "#253866" }}>€{log.sell_price?.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "#00b295" }}>{log.cashback_percent}%</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full w-fit"
                        style={{ color: s.color, backgroundColor: s.bg }}>
                        {log.status === "failed"
                          ? <XCircle className="w-3 h-3" />
                          : <CheckCircle className="w-3 h-3" />}
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleDateString("it-IT")}
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
