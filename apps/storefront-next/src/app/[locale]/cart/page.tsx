"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createCart } from "@/lib/medusa/store";

export default function CartPage() {
  const params = useParams();
  const locale = String(params.locale || "it");
  const [cartId, setCartId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "creating" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = window.localStorage.getItem("wb_cart_id");
    if (existing) {
      setCartId(existing);
      setStatus("ready");
    }
  }, []);

  const ensureCart = async () => {
    setStatus("creating");
    setError(null);
    try {
      const data = await createCart();
      window.localStorage.setItem("wb_cart_id", data.cart.id);
      setCartId(data.cart.id);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Errore creazione carrello.");
    }
  };

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold text-[#253866]">Carrello</h1>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          {status === "ready" && cartId ? (
            <>
              <p className="text-sm text-gray-700">Carrello pronto.</p>
              <p className="mt-2 break-all text-xs text-gray-500">ID: {cartId}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">Nessun carrello attivo.</p>
              {status === "error" && error ? (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              ) : null}
              <button
                onClick={ensureCart}
                disabled={status === "creating"}
                className="mt-4 rounded-xl bg-[#253866] px-4 py-2.5 text-white disabled:opacity-50"
              >
                {status === "creating" ? "Creazione..." : "Crea carrello"}
              </button>
            </>
          )}
        </div>

        <Link
          href={`/${locale}/shop`}
          className="mt-6 inline-block text-sm font-semibold text-[#253866] hover:opacity-80"
        >
          Torna allo Shop
        </Link>
      </div>
    </main>
  );
}
