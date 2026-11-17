"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  createCartPaymentSession,
  retrieveCart,
  type StoreCart,
} from "@/lib/medusa/store";
import { MedusaError } from "@/lib/medusa/http";
import {
  shippingLabel,
  validateItAddress,
  type ItAddress,
} from "@/lib/commerce/address";

const stripePk = process.env.NEXT_PUBLIC_STRIPE_PK || "";

const emptyAddress: ItAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  city: "",
  postal_code: "",
  province: "",
  phone: "",
  country_code: "it",
  codice_fiscale: "",
};

function getStripeClientSecret(cart: StoreCart | null): string | undefined {
  const sessions = cart?.payment_collection?.payment_sessions;
  if (!sessions?.length) return undefined;
  const stripeSession = sessions.find((s) => (s.provider_id || "").includes("stripe"));
  return stripeSession?.data?.client_secret || sessions[0]?.data?.client_secret;
}

function StripePayForm({ onDone }: { onDone: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const params = useParams();
  const [pending, setPending] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setPending(true);
    const locale = String(params.locale || "it");
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/checkout/conferma`,
      },
      redirect: "if_required",
    });
    setPending(false);
    if (error) onDone(error.message || "Pagamento fallito");
    else router.push(`/${locale}/checkout/conferma`);
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
        {pending ? "Elaborazione…" : "Paga con carta di prova"}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const locale = String(params.locale || "it");
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionPending, setSessionPending] = useState(false);
  const [shipping, setShipping] = useState<ItAddress>(emptyAddress);
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<ItAddress>(emptyAddress);
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  const stripePromise = useMemo(() => (stripePk ? loadStripe(stripePk) : null), []);
  const clientSecret = getStripeClientSecret(cart);
  const productGross = (cart?.total ?? 0) > 1000 ? (cart?.total ?? 0) / 100 : cart?.total ?? 0;

  useEffect(() => {
    const cartId = window.localStorage.getItem("wb_cart_id");
    if (!cartId) {
      setError("Nessun carrello. Aggiungi un prodotto dallo shop.");
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
          if (sessionRes?.cart) setCart(sessionRes.cart);
        } catch (e) {
          if (!cancelled) {
            setError(e instanceof MedusaError ? e.message : "Sessione di pagamento non disponibile.");
          }
        } finally {
          if (!cancelled) setSessionPending(false);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof MedusaError ? e.message : "Errore carrello");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const field = (
    label: string,
    key: keyof ItAddress,
    target: ItAddress,
    setTarget: (next: ItAddress) => void
  ) => (
    <label className="block text-sm" key={key}>
      <span className="font-semibold text-[#253866]">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
        value={target[key] || ""}
        onChange={(event) => setTarget({ ...target, [key]: event.target.value })}
      />
    </label>
  );

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-12">
      <Link href={`/${locale}/cart`} className="text-sm font-semibold text-[#253866]">
        ← Carrello
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold text-[#253866]">Checkout</h1>
      <p className="mt-2 text-sm text-gray-600">
        Italia, prezzi IVA 22% inclusa. Spedizione standard {shippingLabel("standard", productGross)}.
        Express {shippingLabel("express", productGross)}. Importi corriere ancora placeholder.
      </p>

      {!stripePk ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          <p className="font-semibold">Pagamenti in configurazione</p>
          <p className="mt-2">
            Il negozio è aperto in lettura. Il pagamento con carta si attiva quando sono impostate
            le chiavi Stripe di test.
          </p>
        </div>
      ) : null}

      <form
        className="mt-8 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const errors = [
            ...validateItAddress(shipping),
            ...(billingSame ? [] : validateItAddress(billing)),
          ];
          setAddressErrors(errors);
        }}
      >
        <h2 className="text-lg font-extrabold text-[#253866]">Spedizione</h2>
        {field("Nome", "first_name", shipping, setShipping)}
        {field("Cognome", "last_name", shipping, setShipping)}
        {field("Indirizzo", "address_1", shipping, setShipping)}
        {field("CAP", "postal_code", shipping, setShipping)}
        {field("Città", "city", shipping, setShipping)}
        {field("Provincia", "province", shipping, setShipping)}
        {field("Telefono", "phone", shipping, setShipping)}
        {field("Codice fiscale (opzionale)", "codice_fiscale", shipping, setShipping)}
        <fieldset className="space-y-2 text-sm">
          <legend className="font-semibold text-[#253866]">Consegna</legend>
          <label className="flex gap-2">
            <input
              type="radio"
              checked={method === "standard"}
              onChange={() => setMethod("standard")}
            />
            Standard — {shippingLabel("standard", productGross)}
          </label>
          <label className="flex gap-2">
            <input
              type="radio"
              checked={method === "express"}
              onChange={() => setMethod("express")}
            />
            Express — {shippingLabel("express", productGross)}
          </label>
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={billingSame}
            onChange={(event) => setBillingSame(event.target.checked)}
          />
          Fatturazione uguale alla spedizione
        </label>
        {!billingSame ? (
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-[#253866]">Fatturazione</h2>
            {field("Nome", "first_name", billing, setBilling)}
            {field("Cognome", "last_name", billing, setBilling)}
            {field("Indirizzo", "address_1", billing, setBilling)}
            {field("CAP", "postal_code", billing, setBilling)}
            {field("Città", "city", billing, setBilling)}
            {field("Provincia", "province", billing, setBilling)}
            {field("Telefono", "phone", billing, setBilling)}
          </div>
        ) : null}
        <button type="submit" className="rounded-xl border border-[#253866] px-4 py-2 text-sm font-semibold">
          Controlla indirizzo
        </button>
        {addressErrors.length ? (
          <ul className="list-disc pl-5 text-sm text-red-700">
            {addressErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </form>

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
      {sessionPending ? <p className="mt-6 text-sm text-gray-600">Preparazione pagamento…</p> : null}

      {stripePk && clientSecret && stripePromise ? (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePayForm onDone={setError} />
          </Elements>
        </div>
      ) : null}
    </main>
  );
}
