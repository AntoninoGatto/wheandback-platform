"use client";

import { useState } from "react";
import { addLineItem, ensureCartId, listRegions, pickDefaultRegionId } from "@/lib/medusa/store";
import { MedusaError } from "@/lib/medusa/http";

export function AddVariantButton({ variantId }: { variantId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        className="rounded-xl bg-[#253866] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        onClick={async () => {
          setPending(true);
          setMessage(null);
          try {
            let regionId = window.localStorage.getItem("wb_region_id") || undefined;
            if (!regionId) {
              const { regions } = await listRegions();
              regionId = pickDefaultRegionId(regions);
              if (regionId) window.localStorage.setItem("wb_region_id", regionId);
            }
            const cartId = await ensureCartId(regionId);
            await addLineItem(cartId, variantId, 1);
            setMessage("Aggiunto al carrello");
          } catch (error) {
            setMessage(error instanceof MedusaError ? error.message : "Non aggiunto");
          } finally {
            setPending(false);
          }
        }}
      >
        Aggiungi al carrello
      </button>
      {message ? <p className="mt-1 text-xs text-[#293241]">{message}</p> : null}
    </div>
  );
}
