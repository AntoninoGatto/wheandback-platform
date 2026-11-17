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

- Region che contiene `it`, valuta EUR. Se non esiste, lo script crea **Italia** (EUR, paese `it`).
- Se il seed demo ha già messo l’Italia in **Europe** insieme ad altri paesi, **non la sposta**. Un paese sta in una sola region: toglierlo da Europe farebbe cadere i prezzi legati a quella region e i provider di pagamento già attivi, compresi i carrelli aperti. I prezzi di spedizione vengono scritti in EUR e sulla region che contiene già `it`, quindi valgono per tutta quella region finché l’Italia resta lì.
- Aliquota **IVA 22%** (`it_vat_22`), prezzi trattati come **IVA inclusa**.
- Region placeholder **Europa** sul paese `at`, senza IVA automatica.
- Spedizione placeholder (non sono tariffe di un corriere reale). Lo script **aggiorna** le opzioni demo `Standard Shipping` / `Express Shipping` (oggi a 10 EUR sul DB Railway) oppure le **crea** sul service zone del seller se mancano:
  - standard **€ 5,90** (`amount` 5.9, unità intere come nel seed Medusa)
  - express **€ 9,90**
  - la standard ha anche un prezzo **0** con regola Medusa `item_total` `gte` soglia. La soglia è `SHIPPING_FREE_THRESHOLD_CENTS / 100` (default 49), perché il motore confronta `item_total` nella stessa unità di `amount`. Vince il prezzo con più regole soddisfatte, quindi sotto soglia resta 5,90. Non è «gratis»: è inclusa nel servizio.
  - il prezzo USD del demo resta 10, così la valuta non usata dal checkout IT non sparisce.

## Email

`RESEND_API_KEY` e `RESEND_FROM` sull’API. Se mancano, l’invio è un no-op e l’ordine resta valido. L’hook è `sendTransactionalEmail` (niente SDK legato a un solo provider).
