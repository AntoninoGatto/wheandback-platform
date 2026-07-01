"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle, FileText, Send } from "lucide-react";
import { acceptPartnerInvitation, type SellerInvitationRow } from "@/lib/seller/invitation-actions";
import { PARTNER_CONTRACT, PARTNER_PRODUCT_RULES_SUMMARY } from "@/constants/partner-contract";

type PartnerInviteClientProps = {
  invitation: SellerInvitationRow;
  isLoggedIn: boolean;
  userEmail?: string;
};

export default function PartnerInviteClient({
  invitation,
  isLoggedIn,
  userEmail,
}: PartnerInviteClientProps) {
  const params = useParams();
  const locale = params.locale as string;
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    company: invitation.company_name ?? "",
    vat: "",
    name: invitation.contact_name ?? "",
    email: invitation.email,
    phone: "",
    categories: invitation.product_categories ?? "",
    description: "",
    supplier_country: "IT",
    delivery_sla_days: "5",
    signed_contract_note: "",
  });

  const loginHref = `/${locale}/auth/login?redirect=/${locale}/partner/invito/${invitation.token}`;
  const registerHref = `/${locale}/auth/register?redirect=/${locale}/partner/invito/${invitation.token}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Accedi o registrati per completare l'onboarding.");
      return;
    }
    if (!contractAccepted || !termsAccepted) {
      setError("Accetta contratto e termini per procedere.");
      return;
    }

    setError("");
    const fd = new FormData();
    fd.set("token", invitation.token);
    Object.entries(formData).forEach(([k, v]) => fd.set(k, v));
    fd.set("contract_accepted", "true");
    fd.set("terms_accepted", "true");

    startTransition(async () => {
      const result = await acceptPartnerInvitation(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-12 max-w-lg mx-auto">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: "#00b295" }} />
        </div>
        <h2 className="text-xl font-black mb-2" style={{ color: "#253866" }}>
          Candidatura inviata!
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          Il team Whe&Back® verificherà i dati e attiverà il tuo portale partner.
          Invia il contratto firmato in PDF a{" "}
          <strong>{PARTNER_CONTRACT.CONTRACT_EMAIL}</strong>.
        </p>
        <Link
          href={`/${locale}/partner/in-attesa`}
          className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#00b295" }}
        >
          Vai allo stato candidatura
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
        style={{ backgroundColor: "rgba(0,178,149,0.12)", color: "#00b295" }}
      >
        Invito Partner Whe&Back®
      </span>
      <h1 className="text-3xl font-black mb-3" style={{ color: "#253866" }}>
        Benvenuto{invitation.company_name ? `, ${invitation.company_name}` : ""}
      </h1>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Completa l&apos;onboarding per vendere sul marketplace Whe&Back®. I prodotti che non rispettano
        i filtri di qualità verranno bloccati automaticamente.
      </p>

      {invitation.notes && (
        <div
          className="rounded-xl p-4 mb-6 text-sm text-gray-600"
          style={{ backgroundColor: "rgba(37,56,102,0.04)" }}
        >
          <strong style={{ color: "#253866" }}>Nota da Whe&Back®:</strong> {invitation.notes}
        </div>
      )}

      {!isLoggedIn && (
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{ backgroundColor: "rgba(245,158,11,0.08)", color: "#b45309" }}
        >
          <p className="font-semibold mb-2">Prima accedi o registrati</p>
          <div className="flex flex-wrap gap-2">
            <Link href={loginHref} className="px-4 py-2 rounded-lg bg-white font-bold text-xs border">
              Accedi
            </Link>
            <Link
              href={registerHref}
              className="px-4 py-2 rounded-lg text-white font-bold text-xs"
              style={{ backgroundColor: "#253866" }}
            >
              Crea account
            </Link>
          </div>
        </div>
      )}

      {isLoggedIn && userEmail && userEmail.toLowerCase() !== invitation.email.toLowerCase() && (
        <div className="flex items-start gap-2 p-4 rounded-xl mb-6 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Sei connesso come {userEmail}. Per questo invito usa{" "}
            <strong>{invitation.email}</strong>.
          </span>
        </div>
      )}

      <div
        className="rounded-2xl border border-gray-100 p-5 mb-6"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4" style={{ color: "#253866" }} />
          <h2 className="font-black text-sm" style={{ color: "#253866" }}>
            Contratto e regole prodotti
          </h2>
        </div>
        <ul className="space-y-1.5 text-xs text-gray-600 mb-4">
          {PARTNER_PRODUCT_RULES_SUMMARY.map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>
        <Link
          href={`/${locale}/legal/contratto-partner`}
          target="_blank"
          className="text-xs font-bold underline"
          style={{ color: "#00b295" }}
        >
          Leggi il contratto completo (v.{PARTNER_CONTRACT.VERSION})
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl mb-4 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "company", label: "Ragione Sociale *", type: "text" },
            { key: "vat", label: "P.IVA / VAT", type: "text" },
            { key: "name", label: "Referente *", type: "text" },
            { key: "email", label: "Email invito *", type: "email", readOnly: true },
            { key: "phone", label: "Telefono", type: "tel" },
            { key: "categories", label: "Categorie prodotti *", type: "text" },
            { key: "supplier_country", label: "Paese fornitore (ISO)", type: "text" },
            { key: "delivery_sla_days", label: "Giorni evasione (SLA)", type: "number" },
          ].map(({ key, label, placeholder, type, readOnly }) => (
            <div key={key} className={key === "categories" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                {label}
              </label>
              <input
                type={type}
                required={label.includes("*")}
                readOnly={readOnly}
                value={formData[key as keyof typeof formData]}
                onChange={(e) =>
                  !readOnly && setFormData({ ...formData, [key]: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
            Descrizione attività *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
            Riferimento contratto firmato (opzionale)
          </label>
          <input
            value={formData.signed_contract_note}
            onChange={(e) => setFormData({ ...formData, signed_contract_note: e.target.value })}
            placeholder="Es. inviato il 18/06/2026 a partners@wheback.it"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer rounded-xl p-4 border border-gray-100">
          <input
            type="checkbox"
            checked={contractAccepted}
            onChange={(e) => setContractAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            Accetto il{" "}
            <Link href={`/${locale}/legal/contratto-partner`} className="underline font-semibold" target="_blank">
              Contratto di Convenzionamento v.{PARTNER_CONTRACT.VERSION}
            </Link>{" "}
            e invierò copia firmata a {PARTNER_CONTRACT.CONTRACT_EMAIL}.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer rounded-xl p-4 border border-gray-100">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            Dichiaro di aver letto le regole prodotti e di assumermi la responsabilità dei contenuti caricati.
          </span>
        </label>

        <button
          type="submit"
          disabled={!isLoggedIn || isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40"
          style={{ backgroundColor: "#00b295" }}
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isPending ? "Invio..." : "Invia candidatura partner"}
        </button>
      </form>
    </div>
  );
}
