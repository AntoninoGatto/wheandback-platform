# Percorso step-by-step → sito pubblico funzionante al 100%

**Obiettivo finale:** un cliente apre `https://wheback.com`, compra, paga, riceve conferma, e l’ordine viene spedito.  
**Stack:** Mercur API + storefront (`apps/storefront-next`). Non usare il prototipo Supabase `:3000`.  
**Regola:** non passare allo step successivo se il checkpoint non è verde.

---

## STEP 1 — Accendi lo stack locale
**Chi:** Gabriele  
**Stato:** ✅ Completato 2026-10-23 (Docker + Mercur `:9000` + storefront `:3002` — smoke 200)

1. Apri Docker Desktop  
2. `docker compose -f infrastructure/docker/docker-compose.yml up -d`  
3. `npm.cmd run dev:mercur` → `http://localhost:9000`  
4. `npm.cmd run dev:storefront` → `http://localhost:3002/it`  

**Checkpoint:** home, shop, `/seller`, `/dashboard` si aprono senza errori.

---

## STEP 2 — Catalogo minimo (qualcosa da vendere)
**Chi:** Papà decide → Gabriele/Cursor carica  
**Stato:** ✅ Completato 2026-10-23 (11 prodotti in shop; 6 SKU demo IT + seed + prova)  
**Nota:** catalogo **demo** per sbloccare Stripe. Sostituire con fornitore reale quando papà conferma shortlist.

1. Papà sceglie **2–3 categorie** e **1 fornitore** (anche solo il nome)  
2. Compilare riga in `docs/FORNITORI-SHORTLIST.md`  
3. Creare **almeno 10 prodotti** in Mercur (vendor o admin)  
   - Script: `npx medusa exec ./src/scripts/seed-step2-catalog.ts` (da `packages/api`)  
4. Admin: **confirm / publish** ogni prodotto  
5. Verificare su `http://localhost:3002/it/shop`  

**Checkpoint:** ≥ 10 prodotti visibili in shop, con prezzo e immagine.

---

## STEP 3 — Stripe TEST (pagamento prova)
**Chi:** Gabriele  

1. Stripe Dashboard → API keys **test**  
2. In `services/mercur-marketplace/packages/api/.env`:  
   - `STRIPE_API_KEY=sk_test_…`  
3. In `apps/storefront-next/.env.local`:  
   - `NEXT_PUBLIC_STRIPE_PK=pk_test_…`  
4. Riavvia Mercur + storefront  
5. Admin (`:9000/dashboard`) → Settings → **Regions** → abilita **Stripe**  
6. (Consigliato) Stripe CLI:  
   `stripe listen --forward-to localhost:9000/hooks/payment/stripe`  
   → copia secret in `STRIPE_WEBHOOK_SECRET`  
7. Aggiungi prodotto al carrello → `/it/checkout`  
8. Paga con carta `4242 4242 4242 4242`  

**Checkpoint:** pagamento ok + ordine paid visibile in Admin.  
Guida: `docs/STRIPE-CHECKOUT.md`.

---

## STEP 4 — Spedizione e checkout completo
**Chi:** Gabriele + Cursor  

1. In Mercur: configura **shipping method** Italia (costo e nome chiari)  
2. Completare checkout storefront: email + indirizzo spedizione (oltre al pagamento)  
3. Pagina “ordine confermato / success” dopo il pagamento  
4. Ripetere 1 pagamento test end-to-end  

**Checkpoint:** dal carrello al “grazie” senza passaggi manuali nascosti; totale include spedizione.

---

## STEP 5 — Email di conferma ordine
**Chi:** Gabriele + Cursor  

1. Scegliere provider email (Resend / SendGrid / Postmark / SMTP)  
2. Configurare Mercur/notifiche per:  
   - email al **cliente** (ordine ricevuto)  
   - notifica a **admin/vendor** (nuovo ordine)  
3. Rifare un ordine test e controllare la casella email  

**Checkpoint:** dopo il pagamento arriva almeno 1 email cliente.

---

## STEP 6 — Hosting API Mercur (produzione)
**Chi:** Gabriele (+ Cursor per config)  
**Stato config:** 2026-11-11 — host deciso (**Railway**) e file nel repo. Restano i click sul pannello. Guida: `docs/BLOCCO-1-DEPLOY.md`.  
**Non fare qui:** DNS, `wheback.com`, `api.wheback.com`.

1. Host: **Railway** (Postgres + Redis plugin). Dockerfile già in `services/mercur-marketplace`
2. Provisionare **Postgres** + **Redis**  
3. Deploy pacchetto API Mercur  
4. Env produzione: `DATABASE_URL`, `REDIS_URL`, `STRIPE_API_KEY` (ancora test), `STRIPE_WEBHOOK_SECRET`, secret JWT, ecc.  
5. `STORE_CORS` deve includere l’URL Vercel (e poi `https://wheback.com`)  
6. Verificare: Admin e Vendor raggiungibili via URL pubblico  

**Checkpoint:** API risponde su `https://…` (anche temporaneo del provider) senza usare localhost.

---

## STEP 7 — Deploy storefront su Vercel
**Chi:** Gabriele  
**Stato config:** 2026-11-11 — `apps/storefront-next/vercel.json`, `.env.example`, Node 22. Il click sulla Root Directory è ancora manuale (`docs/BLOCCO-1-DEPLOY.md`).

1. Progetto Vercel → Settings → **Root Directory** = `apps/storefront-next`
2. Environment Variables:  
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL` = URL API dello STEP 6  
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` = publishable key  
   - `NEXT_PUBLIC_STRIPE_PK` = `pk_test_…`  
3. Redeploy  
4. Aprire `*.vercel.app` → shop, login, carrello  

**Checkpoint:** lo shop su Vercel legge i prodotti dall’API online (non da localhost).

---

## STEP 8 — Stripe su produzione (ancora TEST)
**Chi:** Gabriele  

1. Webhook Stripe → URL pubblico:  
   `https://<api-host>/hooks/payment/stripe`  
2. Aggiornare `STRIPE_WEBHOOK_SECRET` sull’API prod  
3. Region Stripe abilitata anche sull’istanza prod  
4. 1 pagamento test da `*.vercel.app`  

**Checkpoint:** ordine test paid sull’Admin **di produzione**.

---

## STEP 9 — Pagine legali e fiducia
**Chi:** Papà (testi) + Cursor (pagine)  

1. Privacy Policy  
2. Cookie  
3. Termini e condizioni  
4. Spedizioni e resi  
5. Footer con ragione sociale, P.IVA, contatti  
6. Link a queste pagine da footer dello storefront  

**Checkpoint:** da qualsiasi pagina del sito si arriva a Privacy / T&C / Resi.

---

## STEP 10 — Dominio GoDaddy → Vercel + API
**Chi:** Gabriele (+ papà se ha login GoDaddy)  

1. Solo se STEP 7–8 sono verdi  
2. Vercel → Domains → aggiungi `wheback.com` e `www.wheback.com`  
3. GoDaddy DNS: record **esatti** mostrati da Vercel (A + CNAME)  
4. Host API: `api.wheback.com` → server Mercur + SSL  
5. Aggiornare env storefront: backend = `https://api.wheback.com`  
6. Aggiornare `STORE_CORS` = `https://wheback.com` (e www se serve)  
7. Redeploy Vercel  

**Checkpoint:** `https://wheback.com` apre lo shop; HTTPS ok; nessuna chiamata a localhost.  
Guida: `docs/DOMINIO-GODADDY-VERCEL.md`.

---

## STEP 11 — Stripe LIVE
**Chi:** Gabriele (autorizzazione papà)  

1. Sostituire chiavi: `sk_live_…` / `pk_live_…` (API + Vercel)  
2. Webhook live sullo stesso path HTTPS  
3. Un pagamento reale di **basso importo** (amico/famiglia)  

**Checkpoint:** soldi arrivati su Stripe + ordine in Admin + email partita.

---

## STEP 12 — Soft launch operativo
**Chi:** Papà + Gabriele  

1. Accordarsi: chi evade, chi manda tracking, chi risponde al cliente  
2. Completare spedizione dell’ordine pilota  
3. Compilare `docs/CHECKLIST-PRIME-VENDITE.md`  
4. Fixare eventuali bug emersi  
5. Solo allora: aprire a traffico pubblico / ads  

**Checkpoint DoD “funzionante al 100% per i clienti”:**  
cliente compra → paga → riceve email → riceve pacco → margine accettabile.

---

## DOPO (non prima della pubblicazione)

| Ordine | Cosa | Doc |
|--------|------|-----|
| 13 | Cashback | `CASHBACK-DOPO-VENDITE.md` |
| 14 | Referral | `REFERRAL-DOPO-CASHBACK.md` |
| 15 | App mobile | `APP-MOBILE-ULTIMA.md` |

---

## Mappa veloce “dove sei”

| Se sei fermo a… | Fai lo step |
|-----------------|-------------|
| PC acceso, niente online | 1 → 3 |
| Pagamento test ok, niente cloud | 6 → 8 |
| Vercel ok, dominio no | 10 |
| Dominio ok, niente soldi veri | 11 → 12 |
| Già vende | 13+ |

---

## Prossimo step da fare adesso

STEP 1 e STEP 2 sono già verdi in locale.  
Il blocco aperto è **STEP 6 → STEP 7** (Railway + Vercel) seguendo `docs/BLOCCO-1-DEPLOY.md`.  
Non toccare il DNS. Stripe test (STEP 3) può procedere in parallelo sull’API, prima in locale e poi sull’URL Railway.
