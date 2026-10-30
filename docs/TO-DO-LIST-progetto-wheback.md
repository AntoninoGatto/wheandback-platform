# To-do rimanenti — Whe&Back®

**Aggiornato:** 2026-08-01  
**Fonte:** piano 5 giorni + lavorozioni in chat + handoff SSD  
**Come usare:** spunta le caselle man mano. File operativo (può restare locale o essere commitato senza secret).

---

## Stato rapido

| Area | Stato |
|------|--------|
| Giorno 1 — Storefront Next | ✅ Fatto |
| Giorno 2 — Flusso fornitore e2e + prodotto in shop | ✅ Fatto |
| Giorno 3 — UX demo per papà | ✅ Fatto |
| Giorno 4 — Deploy o polish locale | ✅ Fatto (polish locale) |
| Giorno 5 — Collaudo + commit/push + consegna | ✅ Fatto (push 2026-08-01) |
| Trasferimento PC nuovo (setup finale) | ✅ Fatto (2026-08-01) |
| Dopo i 5 giorni (ordine bloccante) | 🔄 Step 1–2 docs pronti; poi Stripe → vendite → cashback → referral → app |

---

## 0) Completare il trasferimento sul nuovo PC

- [x] Docker Desktop avviato
- [x] `docker compose -f infrastructure/docker/docker-compose.yml up -d`
- [x] Se esiste: ripristinare dump con `.\.cursor\transfer\restore-db.ps1` *(skip: nessun dump in cartella)*
- [x] (Se manca build pannelli) `npm.cmd run build:mercur-panels`
- [x] `npm.cmd run dev:mercur` → pronto su porta 9000
- [x] `npm.cmd run dev:storefront` → pronto su porta 3002
- [x] Smoke test browser:
  - [x] http://localhost:3002/it
  - [x] http://localhost:3002/it/shop
  - [x] http://localhost:9000/seller
  - [x] http://localhost:9000/dashboard
- [x] Verificare che i 3 file env esistano ancora (senza aprirli in chat):
  - [x] `.env.local` (root)
  - [x] `apps/storefront-next/.env.local`
  - [x] `services/mercur-marketplace/packages/api/.env`

> Nota nuovo PC (2026-08-01): Postgres Docker mappato su host **5433** perché la **5432** è occupata da PostgreSQL Windows nativo. `DATABASE_URL` usa `localhost:5433`.

---

## 1) Piano 5 giorni — ancora da fare

### Giorno 3 — UX “pronta per papà”

- [x] Shop chiaro anche se/quando vuoto (messaggio + CTA)
- [x] Link evidente **Diventa fornitore** (verso `http://localhost:9000/seller/register`)
- [x] Istruzioni brevi in italiano con i **3 URL**:
  - sito / storefront (`:3002`)
  - vendor (`:9000/seller`)
  - admin (`:9000/dashboard`)
- [x] Done quando: papà capisce subito dove cliccare senza spiegazioni lunghe

### Giorno 4 — Deploy o polish

- [ ] **Se possibile:** deploy pubblico (URL condivisibile) — *rimandato; percorso B scelto*
- [x] **Altrimenti:** demo locale impeccabile (avvio al primo click, checklist)
  - `docs/AVVIO-DEMO.md`
  - `docs/CHECKLIST-PRIMO-CLICK.md`
  - header comune su auth/cart/prodotto
- [x] Done quando: URL pubblico **oppure** checklist demo affidabile

### Giorno 5 — Collaudo + consegna

- [x] Checklist 10 minuti collaudo (cliente / fornitore / admin) — `docs/CHECKLIST-COLLAUDO-10MIN.md` (smoke pagine OK; e2e upload dipende da account)
- [x] Documentazione breve in italiano (cosa mostrare) — `docs/COSA-MOSTRARE-DEMO.md`
- [x] Commit + push su GitHub branch `develop` (**senza** `.env*` / dump / secret) — commit `bf458eb`
- [x] Antonino sa cosa mostrare in demo — vedi `COSA-MOSTRARE-DEMO.md` + `AVVIO-DEMO.md`
- [x] Done quando: consegna chiusa e codice su GitHub

#### Checklist consegna (giorno 5) — dettaglio

- [x] Cliente: home, shop, login/register
- [x] Fornitore: register + carica prodotto *(UI OK; upload e2e manuale se hai account)*
- [x] Admin: vede / approva *(UI OK; login manuale se hai account)*
- [x] Documentazione breve IT
- [x] Codice su GitHub (`develop`) — `bf458eb` pushed

---

## 2) Lavoro tecnico già fatto ma ancora da mettere su GitHub

Queste cose esistono in cartella locale ma **non erano pushate** (all’ultimo check):

- [x] Commit/push `apps/storefront-next/`
- [x] Commit/push hooks store visibility (`product-store-visibility`)
- [x] Commit/push script `setup-new1-seller` / `backfill-product-store-visibility`
- [x] Commit/push `docs/PIANO-5-GIORNI.md` (+ questo file se vuoi)
- [x] Commit/push modifiche `package.json` / `Navbar.tsx` se ancora utili
- [ ] **Non** committare: `.env*`, `*.dump`, secret, CHAT-EXPORT se contiene dati sensibili

> Chiedere conferma prima di commit/push, salvo istruzione diversa.

---

## 3) Dopo i 5 giorni — ordine bloccante (rischio basso)

> **Non fare tutto insieme.** Sequenza obbligatoria: catalogo/fornitori → Stripe → vendite vere → cashback → referral → app.

### Step 1–2 — Catalogo + fornitori (ORA)

- [x] Docs shortlist fornitori EU/IT/US — `docs/FORNITORI-SHORTLIST.md` (**non** CJ come cuore)
- [x] Regole qualità import — `docs/REGOLE-QUALITA-IMPORT.md`
- [x] Piano ingresso prodotti Mercur/shop — `docs/INGRESSO-PRODOTTI-MERCUR.md`
- [ ] Compilare 1–3 fornitori scelti (tabella in FORNITORI-SHORTLIST) con Antonino
- [ ] Onboarding partner reali (es. TGP) via `/seller` (path A ingresso prodotti)
- [ ] Riempire shop gradualmente (≥10 prodotti approved che passano le regole)

### Step 3 — Checkout Stripe

- [ ] Stripe **test** su storefront Mercur — vedi `docs/STRIPE-CHECKOUT.md`
- [ ] Stripe **live** solo dopo test ok

### Step 4 — Prime vendite vere

- [ ] Checklist ordini reali — `docs/CHECKLIST-PRIME-VENDITE.md`
- [ ] Almeno qualche ordine pagato + spedizione + margine verificati

### Step 5 — Cashback (solo dopo step 4)

- [ ] Spec + implementazione — `docs/CASHBACK-DOPO-VENDITE.md` (bloccato finché non ci sono vendite vere)

### Step 6 — Referral (solo dopo step 5)

- [ ] Spec + implementazione — `docs/REFERRAL-DOPO-CASHBACK.md`

### Step 7 — App mobile (ultima)

- [ ] Spec — `docs/APP-MOBILE-ULTIMA.md`

---

## 4) Ancora più avanti (dopo step 4+)

- [ ] Beneficenza / reportistica
- [ ] Più fornitori marketplace (meno dipendenza dal solo dropshipping)
- [ ] Produzione: hosting stabile, sicurezza, backup, MFA

---

## 5) Fuori scope (non fare ora)

- Catalogo pieno tipo Amazon
- CJ come cuore del catalogo
- Cashback/referral/app **prima** delle vendite vere
- Scala Amazon
- Prototipo `:3000` (freeze)

---

## URL di riferimento (locale)

| Ruolo | URL |
|-------|-----|
| Storefront | http://localhost:3002 |
| Admin | http://localhost:9000/dashboard |
| Vendor register | http://localhost:9000/seller/register |
| Vendor panel | http://localhost:9000/seller |
| Prototipo legacy (freeze) | http://localhost:3000 |

---

## Prossimo passo consigliato

1. ~~Macchina 5 giorni~~ ✅  
2. **Compilare shortlist fornitori** con Antonino (`FORNITORI-SHORTLIST.md`) + 10 SKU qualità  
3. Stripe test (`STRIPE-CHECKOUT.md`)  
4. Prime vendite vere — **poi** cashback → referral → app  

Vedi anche: `docs/CHI-FA-COSA-POST-MACCHINA.md`, `docs/FORNITORI-SHORTLIST.md`, `docs/REGOLE-QUALITA-IMPORT.md`, `docs/INGRESSO-PRODOTTI-MERCUR.md`, `docs/STRIPE-CHECKOUT.md`, `docs/PIANO-5-GIORNI.md`, `docs/AVVIO-DEMO.md`
