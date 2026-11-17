# Blocco 2 — Checkout (Stripe test)

Pagamenti in **modalità test**. Nessun cutover DNS.

## Stripe

| Env API (Railway) | Env storefront (Vercel) |
| --- | --- |
| `STRIPE_API_KEY` | `NEXT_PUBLIC_STRIPE_PK` |
| `STRIPE_WEBHOOK_SECRET` | |

Se manca una chiave, lo storefront mostra **«Pagamenti in configurazione»** e l’API non registra il provider Stripe (il processo parte lo stesso).

Webhook nativo Medusa (si attiva solo con il provider):

`POST https://<api>/hooks/payment/stripe`

In Stripe Dashboard (test) punta il webhook a quell’URL e copia il signing secret in `STRIPE_WEBHOOK_SECRET`.

## Stripe Connect

Mercur gestisce i payout vendor nel proprio modulo payout, non come Stripe Connect già collegato. Questo blocco **non** crea connected account, destination charge o transfer. Per i payout Connect servono, più avanti: account piattaforma Stripe Connect, onboarding vendor, e un provider di payout Mercur che usi `stripe_account`. Non è attivo ora. Non impostare chiavi Connect.

## Italia, IVA, spedizione

Script idempotente (da `packages/api`, con API e DB accesi):

```sh
npx medusa exec ./src/scripts/seed-commerce-it.ts
```

- Region che contiene `it`, valuta EUR. Se il seed demo ha già messo l’Italia in «Europe», non duplica la region.
- Aliquota **IVA 22%** (`it_vat_22`), prezzi trattati come **IVA inclusa**.
- Region placeholder **Europa** sul paese `at`, senza IVA automatica.
- Spedizione placeholder (non sono tariffe di un corriere reale):
  - standard **€ 5,90**
  - express **€ 9,90**
  - sopra `SHIPPING_FREE_THRESHOLD_CENTS` (default `4900`, cioè € 49 di prodotti) la standard è inclusa nel servizio. Non è «gratis».

## Email

`RESEND_API_KEY` e `RESEND_FROM` sull’API. Se mancano, l’invio è un no-op e l’ordine resta valido. L’hook è `sendTransactionalEmail` (niente SDK legato a un solo provider).
