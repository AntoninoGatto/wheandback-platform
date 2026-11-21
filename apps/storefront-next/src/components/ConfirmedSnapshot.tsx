"use client";

import { useEffect, useState } from "react";
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "@/lib/medusa/config";
import { formatEuro } from "@/lib/offers-format";

type Line = {
  sku: string;
  qty: number;
  initial_price_cents: number;
  vat_rate_bps: number;
  discount_cents: number;
  price_paid_cents: number;
  reward_cents: number;
  internal_cents: number;
  code: string | null;
  campaign_version: number | null;
};

export function ConfirmedSnapshot() {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("wb_benefit_quote");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { lines?: Line[] };
        if (parsed.lines) setLines(parsed.lines);
      } catch {
        setLines([]);
      }
    }
    const cartId = window.localStorage.getItem("wb_cart_id");
    if (!cartId || !MEDUSA_PUBLISHABLE_KEY) return;
    fetch(`${MEDUSA_BACKEND_URL}/store/benefit-snapshot?cart_id=${encodeURIComponent(cartId)}`, {
      headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { lines?: Line[] } | null) => {
        if (body?.lines?.length) setLines(body.lines);
      })
      .catch(() => undefined);
  }, []);

  if (!lines.length) {
    return <p className="mt-6 text-sm text-[#293241]">Lo snapshot compare qui dopo la conferma del calcolo.</p>;
  }

  return (
    <ul className="mt-6 space-y-3 text-sm text-[#293241]">
      {lines.map((line) => (
        <li key={`${line.sku}-${line.campaign_version ?? "x"}`} className="rounded-2xl bg-[#F1F0F1] p-4">
          <p className="font-semibold text-[#253866]">
            {line.sku} × {line.qty}
          </p>
          <p>Prezzo iniziale {formatEuro(line.initial_price_cents)}</p>
          <p>IVA {(line.vat_rate_bps / 100).toLocaleString("it-IT")}%</p>
          <p>Sconto {formatEuro(line.discount_cents)}</p>
          <p>Pagato {formatEuro(line.price_paid_cents)}</p>
          <p>Premio {formatEuro(line.reward_cents)}</p>
          <p>Quota interna {formatEuro(line.internal_cents)}</p>
          <p>{line.code ? `Codice ${line.code}` : "Nessun codice"}</p>
          <p>{line.campaign_version != null ? `Versione ${line.campaign_version}` : "Nessuna versione"}</p>
        </li>
      ))}
    </ul>
  );
}
