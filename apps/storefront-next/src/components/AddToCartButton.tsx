"use client";

import { useState } from "react";
import {
  addOfferToCart,
  ensureCartId,
  listOffers,
  listRegions,
  pickDefaultRegionId,
} from "@/lib/medusa/store";
import { MedusaError } from "@/lib/medusa/http";

export function AddToCartButton({ productId }: { productId: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const add = async () => {
    setPending(true);
    setMessage(null);
    try {
      let regionId = window.localStorage.getItem("wb_region_id") || undefined;
      if (!regionId) {
        const { regions } = await listRegions();
        regionId = pickDefaultRegionId(regions);
        if (regionId) window.localStorage.setItem("wb_region_id", regionId);
      }

      const { offers } = await listOffers({
        product_id: productId,
        region_id: regionId,
        limit: 10,
      });
      const offer = offers[0];
      if (!offer) {
        setMessage("Nessuna offerta vendibile per questo prodotto.");
        return;
      }

      const cartId = await ensureCartId(regionId);
      await addOfferToCart(cartId, offer.id, 1);
      const price = offer.calculated_price?.calculated_amount;
      setMessage(
        price != null
          ? `Aggiunto al carrello (€ ${Number(price).toFixed(2)}). Vai al checkout.`
          : "Aggiunto al carrello. Vai al checkout."
      );
    } catch (e) {
      setMessage(
        e instanceof MedusaError ? e.message : "Errore aggiunta al carrello"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={add}
        className="rounded-xl bg-[#00b295] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Aggiunta…" : "Aggiungi al carrello"}
      </button>
      {message ? <p className="text-sm text-gray-700">{message}</p> : null}
    </div>
  );
}
