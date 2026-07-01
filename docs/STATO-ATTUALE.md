# STATO ATTUALE — Whe&Back® (prototipo Cursor)

**Data documento:** 2026-06-24  
**Percorso locale:** `C:\Users\Nino\Desktop\wheback-platform`  
**Stack attuale:** Next.js 16 + Supabase (PostgreSQL) + Stripe (placeholder) + CJ Dropshipping + OpenAI  
**Destinazione approvata:** Medusa.js + Mercur + Next.js storefront + app mobile + PostgreSQL + Redis (vedi `DECISIONI-TECNICHE.md`)

> **Regola operativa:** fino a completamento architettura e repository GitHub, **non aggiungere nuove funzionalità** al prototipo. Solo documentazione, fix critici e preparazione migrazione.

---

## 1. Riepilogo esecutivo

Il prototipo realizzato con Cursor Pro è un **marketplace/e-commerce funzionante a livello demo**, con:

- Frontend pubblico multilingua (IT, EN, FR, ES, DE)
- Area admin, area venditore/partner, auth Supabase
- Import prodotti CJ Dropshipping con regole catalogo
- Logiche business cashback/referral/beneficenza **codificate** (costanti + DB parziale)
- Onboarding fornitori con inviti, contratto, approvazione admin

**Non è ancora** una piattaforma production-ready: mancano test, Git, ambienti separati, modularizzazione, Stripe reale, app mobile, Redis, audit trail completo, MFA.

---

## 2. Funzionalità implementate

### A. Frontend pubblico (pagine)

| Area | Route esempio | Stato | Note |
|------|---------------|-------|------|
| Homepage | `/it` | ✅ Funzionante | Hero, come funziona, prodotti trending, beneficenza |
| Shop | `/it/shop` | ✅ Funzionante | Catalogo + ricerca CJ con filtri tier |
| Scheda prodotto | `/it/shop/[slug]` | ✅ Funzionante | Immagini, recensioni CJ importate |
| Cashback | `/it/cashback` | ✅ Pagina informativa | Logica DB parziale |
| Referral | `/it/referral` | ✅ Pagina + UI | Logica multilivello in DB |
| Beneficenza | `/it/beneficenza` | ✅ Pagina | 1% fatturato — report admin |
| Produttori / B2B | `/it/produttori` | ✅ Pagina | Candidatura partner |
| Chi siamo, FAQ, Blog, Contatti, Regole | varie | ✅ Presenti | Alcuni contenuti da allineare al PRD |
| Login / Registrazione | `/it/auth/*` | ✅ Supabase Auth | |
| Dashboard cliente | `/it/dashboard` | ✅ Base | |
| Checkout success | `/it/checkout/success` | ⚠️ Parziale | Stripe non configurato |
| Contratto partner | `/it/legal/contratto-partner` | ✅ Stampabile | |
| Onboarding partner | `/it/partner/invito/[token]` | ✅ Funzionante | Richiede migration 012 |
| Partner in attesa | `/it/partner/in-attesa` | ✅ Funzionante | |

### B. Admin (`/it/admin/*`)

| Sezione | Stato | Note |
|---------|-------|------|
| Dashboard admin | ✅ | |
| Import CJ Dropshipping | ✅ | Ricerca + import con regole catalogo |
| Log import | ✅ | |
| Prodotti | ✅ | Approvazione / gestione |
| Utenti | ✅ | |
| Venditori / Partner | ✅ | Approva, rifiuta, contratto ricevuto |
| Inviti Partner | ✅ | TGP SRL invitato |
| Beneficenza, Royalty, Piano marketing | ✅ | Report / gestione base |

### C. Area venditore (`/it/seller/*`)

| Sezione | Stato | Note |
|---------|-------|------|
| Dashboard venditore | ✅ | Gate se non approvato → in-attesa |
| Prodotti | ✅ | Lista prodotti partner |
| Nuovo prodotto | ✅ | Validazione server-side regole catalogo |
| Statistiche | ✅ | Base |

### D. API routes (`/api/*`)

| Endpoint | Funzione |
|----------|----------|
| `/api/checkout` | Checkout Stripe (chiavi placeholder) |
| `/api/webhook` | Webhook Stripe |
| `/api/shop/search` | Ricerca shop locale + CJ, traduzione query |
| `/api/dropshipping/search` | Ricerca catalogo CJ admin |
| `/api/dropshipping/import` | Import prodotto CJ in DB |
| `/api/dropshipping/backfill-media` | Backfill immagini |
| `/api/cron/sync-dropshipping` | Sync programmato (Vercel cron) |

### E. Database Supabase (12 migration)

| File | Contenuto |
|------|-----------|
| `001_users_roles.sql` | profiles, seller_profiles, ruoli |
| `002_products.sql` | products, categorie |
| `003_orders.sql` | ordini |
| `004_cashback.sql` | cashback_transactions |
| `005_referral.sql` | referral, rewards |
| `006_royalty.sql` | royalty reports |
| `007_marketing_plan.sql` | marketing_plans |
| `008_dropshipping.sql` | colonne CJ, supplier |
| `009_fix_rls_recursion.sql` | `is_admin()` SECURITY DEFINER |
| `010_product_enrichment.sql` | reviews, listed_num, weight |
| `011_supplier_tier_trending.sql` | tier partner/premium/cj, trending |
| `012_seller_onboarding.sql` | inviti, contratto, RLS partner |

**Progetto Supabase cloud:** `oszzfaidnujxytrohjrb.supabase.co`

---

## 3. Logiche business già codificate (da recuperare in Medusa)

File chiave da migrare come **specifica**, non copia-incolla:

| File | Contenuto recuperabile |
|------|------------------------|
| `wheback.prd.md` | PRD ufficiale brand, legal, funzioni |
| `src/constants/cashback.ts` | Margini 50%, cashback 5–35%, referral 35%, beneficenza 1% |
| `src/constants/categories.ts` | Categorie fase 1, blacklist prodotti |
| `src/constants/partner-contract.ts` | Testo contratto partner |
| `src/lib/dropshipping/catalog-rules.ts` | Regole CJ: prezzo min €3, listedNum ≥ 10, stock EU IT |
| `src/lib/seller/partner-catalog-rules.ts` | Validazione prodotti partner |
| `src/lib/shop/trending.ts` | Ranking Partner > Premium > CJ |
| `src/lib/search/translate-query.ts` | Ricerca multilingua → inglese per CJ |
| `messages/*.json` | Traduzioni UI (5 lingue) |
| Componenti `src/components/home/*`, `layout/*` | Grafica brand Montserrat, #00b295, #253866 |

---

## 4. Componenti UI recuperabili (frontend Next.js)

Da riusare in `apps/storefront-next/`:

- `Navbar`, `Footer`, `HeroSection`, `HowItWorks`, `FeaturedProducts`
- `ProductCard`, `ShopPageClient`, `ProductDetailClient`
- `CashbackPageClient`, `ReferralPageClient`, `BeneficenzaPageClient`
- `AdminSidebar`, `SellerSidebar`, `PartnerInviteClient`
- Stili globali Montserrat in `globals.css`

---

## 5. Librerie npm in uso

| Pacchetto | Versione | Uso |
|-----------|----------|-----|
| next | 16.2.9 | Framework |
| react / react-dom | 19.2.4 | UI |
| tailwindcss | 4.x | Stili |
| @supabase/supabase-js, @supabase/ssr | 2.x / 0.12 | Auth + DB (**da sostituire con Medusa backend**) |
| next-intl | 4.13 | i18n (**mantenere**) |
| stripe | 22.x | Pagamenti (**mantenere, estendere Connect**) |
| openai | 6.x | AI descrizioni/traduzione (**modulo ai-service**) |
| zod | 4.x | Validazione (**mantenere in packages/validators**) |
| zustand | 5.x | State client |
| @tanstack/react-query | 5.x | Fetch client |
| lucide-react | 1.x | Icone |
| react-hook-form | 7.x | Form |

**Dev:** eslint, typescript, supabase CLI

---

## 6. Cosa è fragile o non scalabile (da riscrivere)

| Problema | Dettaglio | Azione futura |
|----------|-----------|---------------|
| Backend monolitico in Next.js | API routes + Supabase misti nel frontend | Spostare su Medusa + microservizi |
| Nessun Git / CI | Codice solo su PC, nessuna history | **Priorità 1:** GitHub privato |
| Nessun test automatico | Zero test nel progetto | Aggiungere test per ogni modulo |
| Cashback come campo numerico | Non full ledger audit trail | Modulo `CashbackMovement` come da direttiva |
| Stripe placeholder | Checkout non operativo | Configurare Stripe test → Connect |
| Supabase accoppiato al frontend | Lock-in parziale, RLS complesso | Migrare modello dati su Medusa PostgreSQL |
| CJ integrato ad hoc | Logica in `lib/dropshipping/*` | `supplier-import-service` |
| Email partner manuale | mailto, no Resend/SendGrid | `notification-service` |
| Cache `.next` da copia PC | Causava loop refresh (risolto con `--webpack`) | Docker + ambienti puliti |
| Segreti esposti in chat passate | Chiavi in conversazioni | Rotazione chiavi obbligatoria |
| Git non installato su PC Nino | Impossibile push | Installare Git |
| No staging/prod separati | Solo localhost + Supabase cloud | infrastructure/docker |

---

## 7. Problemi noti / risolti

| Problema | Stato |
|----------|-------|
| PowerShell blocca `npm` | Workaround: `npm.cmd run dev` |
| Loop refresh localhost | ✅ Risolto: eliminata cache `.next` + `next dev --webpack` |
| CJ Auth failed (API key) | Risolto su altro PC con chiave corretta |
| Shop vuoto (filtro CJ) | Risolto: prodotti importati visibili in DB |
| Migration SQL path invece di contenuto | Documentato per Supabase SQL Editor |
| Migration 012 partner | Eseguita (2026-06-24) |
| Invito TGP SRL | Inviato, in attesa onboarding fornitore |

---

## 8. Cosa NON esiste ancora

- App mobile (Flutter / React Native)
- Medusa.js / Mercur backend
- Redis
- Repository GitHub / branch main-develop-staging
- Test automatici
- MFA admin/fornitori
- Audit log completo
- Stripe Connect / Mangopay split payment
- Import CSV/XLSX generico fornitori
- Push notifications
- Ambiente staging dedicato
- Documentazione API formale (OpenAPI)

---

## 9. Inventario file sorgente

- **~103 file** TypeScript/TSX in `src/`
- **12 migration** SQL in `supabase/migrations/`
- **5 file** traduzione in `messages/`
- **PRD:** `wheback.prd.md` (root)

---

## 10. Prossimi passi obbligatori (dalla direttiva tecnica)

1. ☐ Creare repository **GitHub privato** (intestato Whe&Back / Buy All Free LTD)
2. ☐ Installare **Git** su questo PC
3. ☐ Push codice attuale su branch `main` (prototipo storico) + `develop`
4. ☐ Completare documentazione in `docs/`
5. ☐ Definire mappa migrazione prototipo → Medusa/Mercur
6. ☐ **Non** sviluppare nuove feature finché punti 1–5 non sono approvati da Antonino Gatti
7. ☐ Rotazione chiavi API esposte in chat

---

## 11. Valutazione migrazione per area

| Area prototipo | Recupero in Medusa/Mercur | Sforzo |
|----------------|---------------------------|--------|
| Grafica / componenti UI | Alto — convertire in storefront Next | Medio |
| i18n messages | Alto — riusare JSON | Basso |
| Regole business (constants) | Alto — moduli dedicati | Basso |
| Pagine informative | Alto | Basso |
| Auth Supabase | Basso — rifare con Medusa customer | Alto |
| Schema DB Supabase | Medio — confrontare con modello Medusa | Alto |
| CJ dropshipping | Medio — portare in import service | Medio |
| Cashback / referral | Medio — logica sì, implementazione no | Alto |
| Admin custom | Medio — Mercur vendor dashboard + custom | Alto |
| Partner onboarding | Alto — flusso validato, rifare su API | Medio |

---

*Documento generato per allineamento con la direttiva tecnica di Antonino Gatti. Aggiornare ad ogni milestone.*
