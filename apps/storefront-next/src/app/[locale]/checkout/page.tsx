"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  createCartPaymentSession,
  retrieveCart,
  type StoreCart,
} from "@/lib/medusa/store";
import { MedusaError } from "@/lib/medusa/http";

const stripePk = process.env.NEXT_PUBLIC_STRIPE_PK || "";

function getStripeClientSecret(cart: StoreCart | null): string | undefined {
  const sessions = cart?.payment_collection?.payment_sessions;
  if (!sessions?.length) return undefined;
  const stripeSession = sessions.find((s) =>
    (s.provider_id || "").includes("stripe")
  );
  return (
    stripeSession?.data?.client_secret || sessions[0]?.data?.client_secret
  );
}

function StripePayForm({ onDone }: { onDone: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setPending(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${String(
          (window.location.pathname.split("/")[1] || "it")
        )}/checkout?status=ok`,
      },
      redirect: "if_required",
    });
    setPending(false);
    if (error) onDone(error.message || "Pagamento fallito");
    else onDone("Pagamento inviato / confermato (verifica ordine in Admin).");
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        type="button"
        disabled={pending || !stripe}
        onClick={pay}
        className="w-full rounded-xl bg-[#253866] px-4 py-3 text-white disabled:opacity-50"
      >
        {pending ? "Elaborazione…" : "Paga con Stripe (test)"}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const locale = String(params.locale || "it");
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sessionPending, setSessionPending] = useState(false);

  const stripePromise = useMemo(
    () => (stripePk ? loadStripe(stripePk) : null),
    []
  );

  const clientSecret = getStripeClientSecret(cart);

  useEffect(() => {
    const cartId = window.localStorage.getItem("wb_cart_id");
    if (!cartId) {
      setError("Nessun carrello. Vai allo Shop, crea un carrello e riprova.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { cart: loaded } = await retrieveCart(cartId);
        if (cancelled) return;
        setCart(loaded);

        if (!stripePk || getStripeClientSecret(loaded)) return;

        setSessionPending(true);
        try {
          const sessionRes = await createCartPaymentSession(cartId);
          if (cancelled) return;
          if (sessionRes?.cart) {
            setCart(sessionRes.cart);
          } else {
            const refreshed = await retrieveCart(cartId);
            if (!cancelled) setCart(refreshed.cart);
          }
        } catch (e) {
          if (!cancelled) {
            setError(
              e instanceof MedusaError
                ? e.message
                : "Impossibile creare la payment session Stripe (Region + chiavi?)."
            );
          }
        } finally {
          if (!cancelled) setSessionPending(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof MedusaError ? e.message : "Errore caricamento carrello"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-12">
      <Link href={`/${locale}/cart`} className="text-sm font-semibold text-[#253866]">
        ← Carrello
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold text-[#253866]">Checkout</h1>
      <p className="mt-2 text-sm text-gray-600">
        Flusso Stripe sul Mercur storefront. Guida:{" "}
        <code className="rounded bg-gray-100 px-1">docs/STRIPE-CHECKOUT.md</code>
      </p>

      {!stripePk ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          <p className="font-semibold">Stripe non ancora configurato (test)</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>
              Imposta <code>STRIPE_API_KEY=sk_test_…</code> in Mercur API{" "}
              <code>.env</code> e riavvia <code>dev:mercur</code>
            </li>
            <li>
              Imposta <code>NEXT_PUBLIC_STRIPE_PK=pk_test_…</code> in{" "}
              <code>apps/storefront-next/.env.local</code> e riavvia lo storefront
            </li>
            <li>In Admin → Regions abilita il payment provider Stripe</li>
            <li>Crea payment session sul carrello (vedi doc) e ricarica questa pagina</li>
          </ol>
        </div>
      ) : null}

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
      {info ? <p className="mt-6 text-sm text-green-700">{info}</p> : null}

      {cart ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
          <p>
            Carrello: <span className="font-mono text-xs">{cart.id}</span>
          </p>
          <p className="mt-1">Righe: {cart.items?.length ?? 0}</p>
        </div>
      ) : null}

      {stripePk && sessionPending ? (
        <p className="mt-6 text-sm text-gray-600">
          Preparazione pagamento Stripe…
        </p>
      ) : null}

      {stripePk && clientSecret && stripePromise ? (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePayForm onDone={setInfo} />
          </Elements>
        </div>
      ) : stripePk && cart && !clientSecret && !sessionPending ? (
        <p className="mt-6 text-sm text-gray-600">
          Manca la payment session Stripe sul carrello. In Admin → Regions abilita
          Stripe, verifica le chiavi test, poi ricarica. Provider id tipico:{" "}
          <code>pp_stripe_stripe</code>. Guida:{" "}
          <code>docs/STRIPE-CHECKOUT.md</code>.
        </p>
      ) : null}
    </main>
  );
}
