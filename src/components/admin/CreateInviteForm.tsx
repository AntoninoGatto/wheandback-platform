"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle, Copy, Mail, Send } from "lucide-react";
import { createSellerInvitation } from "@/lib/seller/invitation-actions";

export default function CreateInviteForm() {
  const params = useParams();
  const locale = params.locale as string;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    inviteUrl: string;
    emailDraft: { subject: string; body: string; mailto: string };
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set("locale", locale);

    startTransition(async () => {
      const res = await createSellerInvitation(fd);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setResult({ inviteUrl: res.inviteUrl, emailDraft: res.emailDraft });
        e.currentTarget.reset();
      }
    });
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-lg font-black mb-1" style={{ color: "#253866" }}>
        Nuovo invito partner
      </h2>
      <p className="text-xs text-gray-400 mb-5">
        Genera link onboarding + bozza email con contratto per invio manuale (es. azienda materiale elettrico).
      </p>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="rounded-xl p-4 mb-5 space-y-3"
          style={{ backgroundColor: "rgba(0,178,149,0.06)", border: "1px solid rgba(0,178,149,0.2)" }}>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#00b295" }}>
            <CheckCircle className="w-4 h-4" /> Invito creato
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Link onboarding</p>
            <div className="flex gap-2">
              <code className="text-xs flex-1 break-all bg-white p-2 rounded-lg border">{result.inviteUrl}</code>
              <button type="button" onClick={() => copyText(result.inviteUrl)}
                className="p-2 rounded-lg border bg-white" title="Copia link">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={result.emailDraft.mailto}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-bold"
              style={{ backgroundColor: "#253866" }}>
              <Mail className="w-3 h-3" /> Apri email precompilata
            </a>
            <button type="button" onClick={() => copyText(result.emailDraft.body)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold">
              <Copy className="w-3 h-3" /> Copia testo email
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Email fornitore *</label>
            <input name="email" type="email" required placeholder="info@azienda.it"
              className="w-full px-3 py-2 rounded-xl border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Ragione sociale</label>
            <input name="company_name" placeholder="Es. Elettrica Rossi Srl"
              className="w-full px-3 py-2 rounded-xl border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Referente</label>
            <input name="contact_name" placeholder="Nome cognome"
              className="w-full px-3 py-2 rounded-xl border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Categorie previste</label>
            <input name="product_categories" placeholder="Es. Minuteria elettrica"
              className="w-full px-3 py-2 rounded-xl border text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Note per il fornitore</label>
          <textarea name="notes" rows={2} placeholder="Es. accordi verbali del 15/06/2026..."
            className="w-full px-3 py-2 rounded-xl border text-sm resize-none" />
        </div>
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
          style={{ backgroundColor: "#00b295" }}>
          {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          Genera invito + email
        </button>
      </form>
    </div>
  );
}
