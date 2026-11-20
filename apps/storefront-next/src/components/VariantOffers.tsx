"use client";

import { useEffect, useState } from "react";
import { couponPieceCopy, formatEuro, referrerPieceCopy } from "@/lib/offers-format";

export type OfferVariant = { id: string; title?: string | null; sku?: string | null };

type PublicOffer = {
  variant_id: string;
  sku: string;
  public_price_cents: number;
  in_review: boolean;
  reward: { bps: number; cents_per_unit: number; base_cents: number } | null;
  codes: {
    code: string;
    discount_bps: number;
    discount_cents: number;
    price_cents: number;
    ends_at: string;
    timezone: string;
  }[];
};

export function VariantOffers({
  variants,
  backendUrl,
  publishableKey,
}: {
  variants: OfferVariant[];
  backendUrl: string;
  publishableKey?: string;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [offer, setOffer] = useState<PublicOffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!variantId) return;
    let cancelled = false;
    setError(null);
    fetch(`${backendUrl}/store/variant-offers?variant_id=${encodeURIComponent(variantId)}`, {
      headers: publishableKey ? { "x-publishable-api-key": publishableKey } : {},
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Offerta non disponibile");
        return response.json() as Promise<{ offer: PublicOffer }>;
      })
      .then((body) => {
        if (!cancelled) setOffer(body.offer);
      })
      .catch(() => {
        if (!cancelled) {
          setOffer(null);
          setError("Prezzo e codici si aggiornano quando il catalogo risponde.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [variantId, backendUrl, publishableKey]);

  if (!variants.length) {
    return <p className="mt-6 text-sm text-[#293241]">Nessuna variante selezionabile.</p>;
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#F1F0F1] bg-white p-5">
      <label className="block text-sm font-semibold text-[#253866]">
        Variante
        <select
          className="mt-2 w-full rounded-xl border border-[#F1F0F1] bg-white px-3 py-2"
          value={variantId}
          onChange={(event) => setVariantId(event.target.value)}
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.title || variant.sku || variant.id}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="mt-4 text-sm text-[#293241]">{error}</p> : null}
      {offer ? (
        <div className="mt-4 space-y-3 text-sm text-[#293241]">
          <p className="text-2xl font-extrabold text-[#253866]">{formatEuro(offer.public_price_cents)}</p>
          {offer.in_review ? (
            <p className="rounded-xl bg-[#F1F0F1] px-3 py-2">In revisione: nessun vantaggio su questa variante.</p>
          ) : null}
          {offer.reward ? (
            <p>{referrerPieceCopy(offer.reward.cents_per_unit, offer.reward.bps, offer.reward.base_cents)}</p>
          ) : (
            <p>Nessun premio referral su questa variante.</p>
          )}
          {offer.codes.length ? (
            <ul className="space-y-2">
              {offer.codes.map((code) => (
                <li key={code.code} className="rounded-xl bg-[#F1F0F1] px-3 py-2">
                  <span className="font-semibold text-[#253866]">{code.code}</span>
                  {" · "}
                  {couponPieceCopy(code.discount_cents, code.discount_bps, code.price_cents)}
                  {" · fino al "}
                  {new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeZone: code.timezone || "Europe/Rome" }).format(
                    new Date(code.ends_at)
                  )}{" "}
                  ({code.timezone || "Europe/Rome"})
                </li>
              ))}
            </ul>
          ) : (
            <p>Nessun codice attivo su questa variante.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
