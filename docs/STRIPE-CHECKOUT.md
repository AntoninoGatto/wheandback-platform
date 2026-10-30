# Checkout Stripe — storefront Mercur (`:3002`)

**Ordine roadmap:** solo **dopo** catalogo/fornitori minimi (step 1–2).  
**Freeze:** non usare il checkout del prototipo `:3000`.

---

## Cosa è già in codice

- Provider Stripe in [`medusa-config.ts`](../services/mercur-marketplace/packages/api/medusa-config.ts) (`@medusajs/medusa/payment-stripe`)
- Template env API: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` in `.env.template`
- Pagina checkout storefront: `/[locale]/checkout` (Stripe Payment Element quando c’è `NEXT_PUBLIC_STRIPE_PK`)
- All’apertura del checkout, se manca la session, lo storefront prova `createCartPaymentSession` da solo (serve Region Stripe abilitata)

---

## Setup Stripe TEST (obbligatorio prima del live)

### 1) Chiavi test (Dashboard Stripe → Developers → API keys)

| Dove | Variabile | Valore |
|------|-----------|--------|
| `services/mercur-marketplace/packages/api/.env` | `STRIPE_API_KEY` | `sk_test_…` |
| `apps/storefront-next/.env.local` | `NEXT_PUBLIC_STRIPE_PK` | `pk_test_…` |

**Non commitare** i valori. Riavvia `dev:mercur` e `dev:storefront`.

### 2) Abilita Stripe sulla Region (Admin)

1. `http://localhost:9000/dashboard`  
2. Settings → Regions → regione (es. Europe / IT)  
3. Payment providers → abilita **Stripe**  
4. Salva

### 3) Webhook (locale)

- Stripe CLI: `stripe listen --forward-to localhost:9000/hooks/payment/stripe`
- Copia signing secret → `STRIPE_WEBHOOK_SECRET` nell’`.env` API

### 4) Prova pagamento

1. Aggiungi prodotto al carrello (variante con prezzo)  
2. Apri `http://localhost:3002/it/checkout` (crea da sola la payment session se manca)  
3. Carta test: `4242 4242 4242 4242`, qualsiasi CVC/data futura  
4. Ordine deve risultare pagato in Admin

---

## Passaggio a LIVE (solo dopo test ok + vendite pilota)

1. Sostituire `sk_test_` / `pk_test_` con `sk_live_` / `pk_live_`  
2. Webhook endpoint pubblico HTTPS → `/hooks/payment/stripe`  
3. Ricontrollare Region + valuta EUR  
4. Una vendita reale di prova a basso importo

---

## Definition of done (step 3)

- [ ] Chiavi **test** configurate (local, non in Git)  
- [ ] Stripe abilitato sulla Region  
- [ ] Checkout storefront completa un pagamento test  
- [ ] Live **non** attivo finché step 4 (prime vendite) non è pianificato

Poi: [`CHECKLIST-PRIME-VENDITE.md`](./CHECKLIST-PRIME-VENDITE.md).
