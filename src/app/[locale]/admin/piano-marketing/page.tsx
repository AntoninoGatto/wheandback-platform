import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { RefreshCw, CheckCircle } from "lucide-react";

async function updateMarketingPlan(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cashback_min = parseFloat(formData.get("cashback_min") as string);
  const cashback_max = parseFloat(formData.get("cashback_max") as string);
  const referral_level1 = parseFloat(formData.get("referral_level1") as string);
  const referral_level2 = parseFloat(formData.get("referral_level2") as string);
  const referral_level3 = parseFloat(formData.get("referral_level3") as string);
  const notes = formData.get("notes") as string;

  // Deactivate all plans
  await supabase.from("marketing_plans").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");

  // Insert new active plan
  await supabase.from("marketing_plans").insert({
    cashback_min, cashback_max,
    referral_level1, referral_level2, referral_level3,
    notes, is_active: true,
    created_by: user!.id,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/it/admin/piano-marketing");
  revalidatePath("/it/piano-marketing");
}

export default async function AdminPianoMarketingPage() {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("marketing_plans")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const { data: history } = await supabase
    .from("marketing_plans")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Piano Marketing</h1>
        <p className="text-gray-400 text-sm mt-1">Modifica le percentuali cashback e referral attive sul sito</p>
      </div>

      {/* Current plan form */}
      <form action={updateMarketingPlan} className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 space-y-5">
        <h2 className="font-black text-base mb-4" style={{ color: "#253866" }}>Aggiorna Piano Attivo</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Cashback Minimo (%)</label>
            <input name="cashback_min" type="number" min="1" max="35" step="0.5"
              defaultValue={plan?.cashback_min ?? 5}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Cashback Massimo (%)</label>
            <input name="cashback_max" type="number" min="1" max="35" step="0.5"
              defaultValue={plan?.cashback_max ?? 35}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "referral_level1", label: "Referral Livello 1 (%)", defaultVal: plan?.referral_level1 ?? 5 },
            { name: "referral_level2", label: "Referral Livello 2 (%)", defaultVal: plan?.referral_level2 ?? 2 },
            { name: "referral_level3", label: "Referral Livello 3 (%)", defaultVal: plan?.referral_level3 ?? 1 },
          ].map(({ name, label, defaultVal }) => (
            <div key={name}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>{label}</label>
              <input name={name} type="number" min="0" max="35" step="0.5" defaultValue={defaultVal}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]" />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>Note (interne)</label>
          <textarea name="notes" rows={2} defaultValue={plan?.notes ?? ""}
            placeholder="Es. Promozione estiva, campagna referral..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] resize-none" />
        </div>

        <button type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#00b295" }}>
          <RefreshCw className="w-4 h-4" />
          Pubblica Nuovo Piano
        </button>
      </form>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-base" style={{ color: "#253866" }}>Storico Piani</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(history ?? []).map((p) => (
            <div key={p.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: "#253866" }}>
                    CB: {p.cashback_min}%–{p.cashback_max}% · Ref: {p.referral_level1}% / {p.referral_level2}% / {p.referral_level3}%
                  </p>
                  {p.is_active && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: "rgba(0,178,149,0.1)", color: "#00b295" }}>
                      <CheckCircle className="w-3 h-3" /> Attivo
                    </span>
                  )}
                </div>
                {p.notes && <p className="text-xs text-gray-400">{p.notes}</p>}
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0">
                {new Date(p.created_at).toLocaleDateString("it-IT")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
