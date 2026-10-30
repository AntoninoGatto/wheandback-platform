# Report pubblicazione — Whe&Back® pronto per il pubblico

**Data:** 2026-10-22  
**Stack di verità:** Mercur (`api`) + storefront Next (`apps/storefront-next`) — **non** il prototipo Supabase `:3000`.  
**Dominio previsto:** `wheback.com` (GoDaddy) → Vercel (frontend) + host API separato.

---

## 1. Verdetto in una frase

Avete una **demo locale funzionante** (shop, vendor, admin, checkout Stripe in codice).  
**Non** siete ancora pronti per clienti reali: mancano hosting API, pagamenti verificati, catalogo reale, spedizioni, legale minimo e cutover dominio.

---

## 2. Cosa c’è già (base solida)

| Area | Stato | Note |
|------|-------|------|
| Storefront Next (`:3002`) | ✅ Locale | Home, shop, prodotto, cart, checkout, login/register |
| Mercur API + Admin + Vendor (`:9000`) | ✅ Locale | Marketplace multi-vendor |
| Visibilità prodotti in shop | ✅ | Hook `product-store-visibility` |
| Wiring Stripe | ✅ Codice | Provider in `medusa-config` + pagina `/checkout` + auto payment session |
| Docs operative | ✅ | Stripe, fornitori, qualità, dominio, chi-fa-cosa |
| Repo GitHub + account Vercel | 🟡 Parziale | Progetto Vercel creato; root dir / env / API prod da chiudere |
| Piano 5 giorni (demo) | ✅ | Chiuso |

---

## 3. Cosa manca per “sito online usabile dai clienti al 100%”

Organizzato in **blocchi bloccanti** (senza questi non si apre al pubblico) e **post-lancio** (si possono fare dopo le prime vendite).

### A) Bloccanti — infrastruttura produzione

| # | Mancanza | Perché è bloccante | Chi |
|---|----------|--------------------|-----|
| A1 | **API Mercur online** (Railway / Fly / VPS) con Postgres + Redis | Vercel hosta solo il frontend; senza `https://api…` shop/cart/login non funzionano in produzione | Gabriele + Cursor |
| A2 | Env produzione storefront | `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, publishable key, `NEXT_PUBLIC_STRIPE_PK` su Vercel | Gabriele |
| A3 | `STORE_CORS` / URL pubblici su Mercur | Senza CORS corretto il browser blocca le chiamate dal dominio | Gabriele + Cursor |
| A4 | Root Directory Vercel = `apps/storefront-next` + deploy verde | Altrimenti rischio build del prototipo sbagliato | Gabriele |
| A5 | DNS GoDaddy → Vercel (`wheback.com` + `www`) | Dominio pubblico | Gabriele (+ papà se ha GoDaddy) |
| A6 | DNS `api.wheback.com` → host Mercur + HTTPS | Frontend deve parlare con API reale, non localhost | Gabriele |

### B) Bloccanti — commerce funzionante

| # | Mancanza | Perché è bloccante | Chi |
|---|----------|--------------------|-----|
| B1 | Stripe **test** end-to-end ok (Region + pagamento `4242`) | Prove che il flusso paga | Gabriele |
| B2 | Stripe **live** + webhook HTTPS pubblico | Soldi reali | Gabriele (ok papà) |
| B3 | Catalogo minimo (≥ 10 prodotti published, qualità ok) | Niente da comprare = sito vuoto | Papà + Gabriele |
| B4 | Fornitore/partner capace di spedire in IT | Ordine pagato senza evasione = disastro | Papà |
| B5 | Region / valuta EUR + **shipping methods** configurati | Checkout incompleto senza spedizione | Gabriele + Cursor |
| B6 | Indirizzo cliente / form checkout completo | Oggi checkout è soprattutto Payment Element; serve address + email ordine | Cursor + Gabriele |
| B7 | Email ordine (conferma cliente + notifica vendor/admin) | Cliente e fornitore devono sapere che c’è un ordine | Cursor + config provider email |
| B8 | Flusso post-pagamento chiaro (pagina success / ordine) | Evitare “ho pagato e non so cosa è successo” | Cursor |

### C) Bloccanti — fiducia / legale minimo (apertura pubblica)

| # | Mancanza | Perché è bloccante | Chi |
|---|----------|--------------------|-----|
| C1 | Privacy Policy + Cookie + Termini (link in footer) | Obbligo base e-commerce EU/IT | Papà / Iubenda / legale |
| C2 | Dati venditore (ragione sociale, P.IVA, contatti) | Trasparenza commerciale | Papà |
| C3 | Policy spedizioni / resi / tempi IT | Aspettative cliente | Papà (testi) + Cursor (pagine) |
| C4 | Età / account cliente verificato enough per vendita | Evitare buchi ovvi | Cursor (base) |

### D) Post-lancio (NON bloccano il “negozio che vende”)

| Area | Stato | Quando |
|------|-------|--------|
| Cashback ledger | ❌ Bloccato volutamente | Dopo vendite vere |
| Referral | ❌ Bloccato | Dopo cashback |
| App mobile | ❌ Bloccato | Ultima |
| Token / Energy Box / rebuild Emergent | ❌ Fuori scope | Non per lancio |
| Keepalive Supabase / prototipo `:3000` | Opzionale | Solo se tenete vivo il vecchio prototipo; **non** è il sito pubblico Mercur |
| Multilingua contenuti marketing rifiniti | Nice | Dopo MVP vendite |

---

## 4. Definizione di “pronto al pubblico” (DoD)

Il sito è **pubblicabile e usabile** quando TUTTI questi punti sono veri:

1. `https://wheback.com` apre lo storefront (HTTPS ok).  
2. Shop mostra ≥ 10 prodotti reali acquistabili.  
3. Cliente può: registrarsi / login → carrello → indirizzo → pagare con carta (Stripe live).  
4. Ordine compare in Admin; vendor/fornitore sa cosa spedire.  
5. Cliente riceve conferma email; spedizione IT con tracking entro tempi dichiarati.  
6. Privacy/T&C/resi raggiungibili dal footer.  
7. Almeno **1 ordine pilota live** (anche basso importo) completato end-to-end.

Cashback/referral/app **non** sono nel DoD del primo lancio pubblico.

---

## 5. Scheletro step → pubblicazione utilizzabile

Seguire **in ordine**. Non saltare i blocchi.

### Fase 0 — Allineamento (1 giorno)

- [ ] Papà: 2–3 categorie + 1 fornitore candidato (`FORNITORI-SHORTLIST.md`)
- [ ] Papà: margine minimo + ETA spedizione IT accettabile
- [ ] Decidere: lancio **senza** cashback (consigliato) vs attendere cashback (ritarda mesi)
- [ ] Confermare stack pubblico = Mercur storefront (non prototipo Supabase)

### Fase 1 — Locale “pagamento test verde” (2–4 giorni)

- [ ] Docker + Mercur + storefront accesi
- [ ] Chiavi Stripe **test** in `.env` API + storefront
- [ ] Admin → Regions → abilita Stripe
- [ ] Webhook locale (`stripe listen`)
- [ ] 5–10 prodotti published (anche manuali) che passano `REGOLE-QUALITA-IMPORT`
- [ ] Config shipping method IT (costo noto)
- [ ] 1 pagamento test `4242` → ordine paid in Admin
- [ ] Commit/push codice Stripe+docs **senza** secret (se non già su GitHub)

### Fase 2 — Produzione API + frontend (3–7 giorni)

- [ ] Provisioning host Mercur (Postgres managed + Redis + app API)
- [ ] Env produzione API: `DATABASE_URL`, `REDIS_URL`, `STRIPE_*`, `STORE_CORS` = `https://wheback.com`
- [ ] Deploy Admin/Vendor raggiungibili (stesso host o path dedicati)
- [ ] Vercel: Root = `apps/storefront-next`, env pubbliche, deploy `*.vercel.app` verde
- [ ] Smoke: shop + login + cart contro API prod (ancora su URL Vercel)
- [ ] Stripe test (o live in modalità controllata) contro API prod + webhook HTTPS

### Fase 3 — Dominio + hardening (1–2 giorni)

- [ ] Aggiungere `wheback.com` / `www` su Vercel
- [ ] Record DNS su GoDaddy (A/CNAME come da pannello Vercel)
- [ ] `api.wheback.com` → host Mercur + SSL
- [ ] Aggiornare env storefront → API pubblica definitiva
- [ ] Verifica HTTPS e assenza di `localhost` in produzione

### Fase 4 — Legale + operativa vendita (in parallelo a Fase 2–3)

- [ ] Testi Privacy / Cookie / T&C / Spedizioni / Resi → pagine + footer
- [ ] Dati azienda in footer / chi-siamo
- [ ] Email transazionali (provider: Resend/SendGrid/Postmark o SMTP)
- [ ] Checklist operativa per papà: chi evade, chi risponde al cliente, chi fa resi
- [ ] Stripe **live** solo dopo test ok

### Fase 5 — Soft launch (1 settimana)

- [ ] 1 ordine pilota reale (amico/famiglia o basso importo)
- [ ] Validare: pagamento → Admin → spedizione → tracking → consegna → margine
- [ ] Fix bug emersi
- [ ] Aprire traffico (Ads / organico) solo dopo pilota ok

### Fase 6 — Dopo che vende (non prima)

- [ ] Cashback ledger (`CASHBACK-DOPO-VENDITE.md`)
- [ ] Referral (`REFERRAL-DOPO-CASHBACK.md`)
- [ ] App (`APP-MOBILE-ULTIMA.md`)

---

## 6. Chi fa cosa (sintesi)

| Ruolo | Focus immediato |
|-------|-----------------|
| **Gabriele** | Stripe test, Vercel root/env, host API, DNS, webhook |
| **Papà / Antonino** | Fornitore, catalogo, margini, testi legali/aziendali, ok live |
| **Cursor** | Checkout completo (indirizzo), shipping UI, email, pagine legali, deploy assistito, fix |
| **Legale / Iubenda** | Privacy, T&C cashback (quando arriverà), cookie |

---

## 7. Stima realistica

| Obiettivo | Tempo tipico se si lavora con continuità |
|-----------|------------------------------------------|
| Solo “sito online” (vetrina + shop che legge API) | ~1 settimana dopo host API |
| “Clienti possono comprare e ricevere” (DoD §4) | **2–4 settimane** (dipende da fornitore + legale) |
| Cashback/referral/app | **Dopo** le prime vendite (settimane/mesi in più) |

Il collo di bottiglia non è solo codice: è **API in produzione + fornitore che spedisce + Stripe live + testi obbligatori**.

---

## 8. Prossimo passo concreto (domani)

1. Papà: nome fornitore #1 + 5 prodotti da mettere online.  
2. Tu: Stripe test locale verde (Region + `4242`).  
3. Insieme: scegliere host API (Railway / Fly / VPS) e partire col deploy Mercur.

Riferimenti: `CHI-FA-COSA-POST-MACCHINA.md`, `STRIPE-CHECKOUT.md`, `DOMINIO-GODADDY-VERCEL.md`, `CHECKLIST-PRIME-VENDITE.md`.
