# Briefing chiamata LinfaTech — cosa manca per andare online

**Data uso:** 2026-10-30  
**Messaggio chiave:** il sito in locale (Mercur + storefront) esiste e vende in demo; per aprirlo al pubblico mancano chiusura tecnica di produzione + decisioni/contenuti business. Cashback/referral/app sono **fase successiva**, non bloccano il primo negozio online.

---

## Apertura (30 secondi)

Abbiamo già la piattaforma marketplace: storefront, admin, area fornitori, carrello e wiring Stripe. Funziona in locale.  
Per metterla **in attività online, completa e utilizzabile dai clienti**, restano due tipi di lavoro:  
1) cose che chiudiamo noi lato progetto / ops;  
2) pezzi più strutturali (catalogo reale, fornitori, meccaniche loyalty, ecc.).

---

## 1) Cosa manca da parte nostra (Gabriele / ops progetto)

Queste voci chiudono l’apertura pubblica del negozio.

1. **Pagamenti Stripe** — completare test end-to-end, poi passare a live + webhook in produzione.  
2. **Deploy storefront su Vercel** — root corretta (`apps/storefront-next`), variabili d’ambiente, build stabile.  
3. **Hosting API Mercur** — backend online (Postgres + Redis), non solo frontend.  
4. **Dominio** — collegare `wheback.com` (GoDaddy) a Vercel e `api.wheback.com` all’API.  
5. **Checkout completo** — indirizzo spedizione, metodo di spedizione IT, pagina conferma ordine.  
6. **Email transazionali** — conferma ordine al cliente + notifica admin/vendor.  
7. **Pagine legali in footer** — Privacy, Cookie, Termini, spedizioni/resi (testi da papà / Iubenda, integrazione sul sito da noi).  
8. **Soft launch** — almeno un ordine pilota reale, verificato fino a spedizione.

---

## 2) Cosa resta più grande / strutturale (non solo “mettere online”)

Queste voci fanno la differenza tra un sito che vende e la piattaforma Whe&Back completa.

1. **Prodotti veri** — oggi in shop c’è un catalogo demo; serve catalogo reale filtrato per qualità.  
2. **Contratti e rapporti coi fornitori** — shortlist, condizioni, chi spedisce in Italia, resi, margini.  
3. **Onboarding fornitori/partner** — processi commerciali e operativi oltre al pannello vendor già presente.  
4. **Cashback** — ledger crediti, regole di maturazione, UI cliente (dopo che ci sono vendite vere).  
5. **Referral / link referral** — attribuzione, anti-frode, single-tier vs multilivello (scelta business + legale).  
6. **Logistica a regime** — tracking, SLA, gestione resi su volumi reali.  
7. **Contenuti e brand a regime** — testi ufficiali, FAQ, chi siamo, policy allineate al modello economico.  
8. **App mobile** — solo dopo web + cashback + referral stabili.  
9. **Fuori scope lancio** — token, Energy Box, rebuild su altri stack.

---

## Distinzione utile in chiamata

| Per aprire il negozio online | Per la piattaforma “definitiva” Whe&Back |
|------------------------------|------------------------------------------|
| Stripe, hosting, dominio, checkout, email, legale minimo, ordine pilota | Fornitori reali, catalogo vero, contratti, cashback, referral, logistica a scala, app |

---

## Chiusura (cosa chiedere a LinfaTech)

Possibili domande:

- Su quali voci della lista 1 potete supportarci (hosting API, deploy, Stripe, email)?  
- Preferite partire da un **MVP vendite** (lista 1) e lasciare cashback/referral in fase 2?  
- Avete già un’offerta per hosting Medusa/Mercur + Postgres/Redis, o usiamo Vercel solo per il frontend?

---

## Una frase se chiedono “quanto manca?”

> Tecnicamente siamo a una demo marketplace funzionante in locale; per andare online ai clienti chiudiamo pagamenti, hosting, dominio, checkout/spedizioni, email e base legale. In parallelo, lato business, restano catalogo reale e fornitori; cashback e referral arrivano dopo le prime vendite, non prima.
