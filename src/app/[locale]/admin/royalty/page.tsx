import { createClient } from "@/lib/supabase/server";
import { FileText, Download } from "lucide-react";

export default async function AdminRoyaltyPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("royalty_reports")
    .select("*")
    .order("report_month", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Report Royalty</h1>
        <p className="text-gray-400 text-sm mt-1">
          5% del fatturato netto mensile — destinato ad Antonino Gatto (titolare del marchio Whe&Back®)
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-2xl p-5 mb-8 border"
        style={{ backgroundColor: "rgba(37,56,102,0.04)", borderColor: "rgba(37,56,102,0.1)" }}>
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong style={{ color: "#253866" }}>Regola PRD §6.2:</strong> Il 5% del fatturato netto mensile è destinato come royalty
          al titolare del marchio. Questo importo viene calcolato automaticamente a fine mese e riportato nei report seguenti.
        </p>
      </div>

      {!reports || reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">Nessun report generato ancora. Il primo report apparirà a fine mese.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Mese</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Fatturato Netto</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Royalty (5%)</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Donazione (1%)</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold" style={{ color: "#253866" }}>
                    {new Date(r.report_month).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-gray-600">€{r.total_revenue?.toFixed(2) ?? "0.00"}</td>
                  <td className="px-6 py-4 font-bold" style={{ color: "#253866" }}>€{r.royalty_amount?.toFixed(2) ?? "0.00"}</td>
                  <td className="px-6 py-4 font-bold" style={{ color: "#00b295" }}>€{r.charity_amount?.toFixed(2) ?? "0.00"}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={r.paid_at
                        ? { backgroundColor: "rgba(0,178,149,0.1)", color: "#00b295" }
                        : { backgroundColor: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                      {r.paid_at ? "Pagato" : "In Attesa"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
