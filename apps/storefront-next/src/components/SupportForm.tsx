"use client";

import { useState } from "react";
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "@/lib/medusa/config";

export function SupportForm({
  fixedType,
  title,
  intro,
}: {
  fixedType?: "assistance" | "return" | "withdrawal";
  title: string;
  intro: string;
}) {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [caseType, setCaseType] = useState(fixedType || "assistance");
  const [result, setResult] = useState<string | null>(null);
  const [lookup, setLookup] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const headers = {
    ...(MEDUSA_PUBLISHABLE_KEY ? { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY } : {}),
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[#253866]">{title}</h1>
      <p className="mt-3 text-sm text-[#293241]">{intro}</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setResult(null);
          const response = await fetch(`${MEDUSA_BACKEND_URL}/store/support`, {
            method: "POST",
            headers: { ...headers, "content-type": "application/json" },
            body: JSON.stringify({ email, order_id: orderId, case_type: caseType, message }),
          });
          const body = (await response.json().catch(() => null)) as { case_number?: string; message?: string } | null;
          setResult(
            response.ok && body?.case_number
              ? `Pratica ${body.case_number}, stato aperta`
              : body?.message || "Invio non riuscito"
          );
        }}
      >
        <label className="block text-sm">
          Email
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block text-sm">
          Ordine, se lo hai
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
        </label>
        {fixedType ? null : (
          <label className="block text-sm">
            Tipo
            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={caseType} onChange={(event) => setCaseType(event.target.value as typeof caseType)}>
              <option value="assistance">Assistenza</option>
              <option value="return">Reso</option>
              <option value="withdrawal">Recesso</option>
            </select>
          </label>
        )}
        <label className="block text-sm">
          Messaggio
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" value={message} onChange={(event) => setMessage(event.target.value)} required />
        </label>
        <button type="submit" className="rounded-xl bg-[#253866] px-4 py-2 text-sm font-semibold text-white">
          Apri la pratica
        </button>
      </form>
      {result ? <p className="mt-4 text-sm font-semibold text-[#253866]">{result}</p> : null}
      <form
        className="mt-8 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await fetch(`${MEDUSA_BACKEND_URL}/store/support?case=${encodeURIComponent(lookup)}`, {
            headers,
          });
          const body = (await response.json().catch(() => null)) as { case_number?: string; status?: string; message?: string } | null;
          setStatus(
            response.ok && body?.case_number ? `${body.case_number}: ${body.status}` : body?.message || "Pratica non trovata"
          );
        }}
      >
        <label className="block text-sm">
          Numero pratica
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={lookup} onChange={(event) => setLookup(event.target.value)} />
        </label>
        <button type="submit" className="rounded-xl border border-[#253866] px-4 py-2 text-sm font-semibold text-[#253866]">
          Leggi lo stato
        </button>
      </form>
      {status ? <p className="mt-4 text-sm text-[#293241]">{status}</p> : null}
    </div>
  );
}
