import { createClient } from "@/lib/supabase/server";
import { Heart } from "lucide-react";

export default async function AdminBeneficenzaPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("royalty_reports")
    .select("*")
    .order("report_month", { ascending: false });

  const totalDonated = reports?.reduce((sum, r) => sum + (r.charity_amount ?? 0), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Report Beneficenza</h1>
        <p className="text-gray-400 text-sm mt-1">
          1% del fatturato netto mensile destinato a &quot;Il Faro della Speranza O.D.V.&quot;
        </p>
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(0,178,149,0.1)" }}>
          <Heart className="w-6 h-6" style={{ color: "#00b295" }} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold">Totale Donazioni Effettuate</p>
          <p className="text-3xl font-black" style={{ color: "#253866" }}>€{totalDonated.toFixed(2)}</p>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-2xl p-5 mb-8 border"
        style={{ backgroundColor: "rgba(0,178,149,0.04)", borderColor: "rgba(0,178,149,0.15)" }}>
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong style={{ color: "#253866" }}>Regola PRD §6.3:</strong> L&apos;1% del fatturato netto viene devoluto mensilmente all&apos;associazione di volontariato
          &quot;Il Faro della Speranza O.D.V.&quot; Ogni report è reso pubblico nella pagina Beneficenza della piattaforma per garantire massima trasparenza.
        </p>
      </div>

      {!reports || reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">Nessun report generato ancora.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Mese</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Fatturato Netto</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Donazione (1%)</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Beneficiario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold" style={{ color: "#253866" }}>
                    {new Date(r.report_month).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-gray-600">€{r.total_revenue?.toFixed(2) ?? "0.00"}</td>
                  <td className="px-6 py-4 font-bold" style={{ color: "#00b295" }}>€{r.charity_amount?.toFixed(2) ?? "0.00"}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">Il Faro della Speranza O.D.V.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
