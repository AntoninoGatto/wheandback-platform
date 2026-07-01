import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Ban, CheckCircle, AlertTriangle } from "lucide-react";

async function blockUser(userId: string, locale: string) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createAdminClient();
  // Block referral code by setting a flag on the profile
  await supabase.from("profiles").update({
    status: "blocked",
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
  revalidatePath(`/${locale}/admin/utenti`);
}

async function warnUser(userId: string, locale: string) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createAdminClient();
  await supabase.from("profiles").update({
    status: "warned",
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
  revalidatePath(`/${locale}/admin/utenti`);
}

async function reinstateUser(userId: string, locale: string) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createAdminClient();
  await supabase.from("profiles").update({
    status: "active",
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
  revalidatePath(`/${locale}/admin/utenti`);
}

export default async function AdminUtentiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, referral_code, created_at")
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    active:   { label: "Attivo",   color: "#00b295", bg: "rgba(0,178,149,0.1)" },
    warned:   { label: "Avvisato", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    blocked:  { label: "Bloccato", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Gestione Utenti</h1>
        <p className="text-gray-400 text-sm mt-1">{users?.length ?? 0} utenti registrati</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {!users || users.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">Nessun utente ancora.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Utente</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Ruolo</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Codice Referral</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Stato</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const s = statusLabel[user.status ?? "active"] ?? statusLabel.active;
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold" style={{ color: "#253866" }}>{user.full_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold capitalize" style={{ color: "#253866" }}>{user.role ?? "customer"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono" style={{ color: "#00b295" }}>{user.referral_code ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== "admin" && (
                        <div className="flex items-center gap-2">
                          {(user.status === "active" || !user.status) && (
                            <>
                              <form action={warnUser.bind(null, user.id, locale)}>
                                <button type="submit"
                                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors hover:bg-amber-50"
                                  style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>
                                  <AlertTriangle className="w-3 h-3" /> Avvisa
                                </button>
                              </form>
                              <form action={blockUser.bind(null, user.id, locale)}>
                                <button type="submit"
                                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                                  style={{ backgroundColor: "#ef4444" }}>
                                  <Ban className="w-3 h-3" /> Blocca
                                </button>
                              </form>
                            </>
                          )}
                          {user.status === "warned" && (
                            <form action={blockUser.bind(null, user.id, locale)}>
                              <button type="submit"
                                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                                style={{ backgroundColor: "#ef4444" }}>
                                <Ban className="w-3 h-3" /> Blocca
                              </button>
                            </form>
                          )}
                          {user.status === "blocked" && (
                            <form action={reinstateUser.bind(null, user.id, locale)}>
                              <button type="submit"
                                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                                style={{ backgroundColor: "#00b295" }}>
                                <CheckCircle className="w-3 h-3" /> Riabilita
                              </button>
                            </form>
                          )}
                        </div>
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
