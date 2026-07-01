import Link from "next/link";
import CreateInviteForm from "@/components/admin/CreateInviteForm";
import { listSellerInvitations } from "@/lib/seller/invitation-actions";

export default async function AdminInvitiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const invitations = await listSellerInvitations();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#253866" }}>
            Inviti Partner
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Invia link onboarding + contratto ai nuovi fornitori (IT, UE, USA).
          </p>
        </div>
        <Link href={`/${locale}/admin/venditori`} className="text-xs font-bold underline" style={{ color: "#00b295" }}>
          ← Gestione venditori
        </Link>
      </div>

      <CreateInviteForm />

      <div className="mt-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-black text-sm" style={{ color: "#253866" }}>
            Inviti inviati ({invitations.length})
          </h2>
        </div>
        {invitations.length === 0 ? (
          <p className="p-8 text-sm text-gray-400 text-center">Nessun invito ancora.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase">
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Azienda</th>
                <th className="text-left px-6 py-3">Scadenza</th>
                <th className="text-left px-6 py-3">Stato</th>
                <th className="text-left px-6 py-3">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invitations.map((inv) => {
                const expired = new Date(inv.expires_at).getTime() < Date.now();
                const url = `${siteUrl}/${locale}/partner/invito/${inv.token}`;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{inv.email}</td>
                    <td className="px-6 py-3 text-gray-500">{inv.company_name || "—"}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(inv.expires_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3">
                      {inv.accepted_at ? (
                        <span className="text-xs font-bold" style={{ color: "#00b295" }}>Accettato</span>
                      ) : expired ? (
                        <span className="text-xs font-bold text-red-500">Scaduto</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600">In attesa</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <code className="text-[10px] break-all">{url}</code>
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
