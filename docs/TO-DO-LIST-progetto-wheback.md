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
| Giorno 5 — Collaudo + commit/push + consegna | ⬜ Da fare |
| Trasferimento PC nuovo (setup finale) | ✅ Fatto (2026-08-01) |
| Dopo i 5 giorni (catalogo, Stripe, cashback…) | ⬜ Dopo |

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

- [ ] Checklist 10 minuti collaudo (cliente / fornitore / admin)
- [ ] Documentazione breve in italiano (cosa mostrare)
- [ ] Commit + push su GitHub branch `develop` (**senza** `.env*` / dump / secret)
- [ ] Antonino sa cosa mostrare in demo
- [ ] Done quando: consegna chiusa e codice su GitHub

#### Checklist consegna (giorno 5) — dettaglio

- [ ] Cliente: home, shop, login/register
- [ ] Fornitore: register + carica prodotto
- [ ] Admin: vede / approva
- [ ] Documentazione breve IT
- [ ] Codice su GitHub (`develop`)

---

## 2) Lavoro tecnico già fatto ma ancora da mettere su GitHub

Queste cose esistono in cartella locale ma **non erano pushate** (all’ultimo check):

- [ ] Commit/push `apps/storefront-next/`
- [ ] Commit/push hooks store visibility (`product-store-visibility`)
- [ ] Commit/push script `setup-new1-seller` / `backfill-product-store-visibility`
- [ ] Commit/push `docs/PIANO-5-GIORNI.md` (+ questo file se vuoi)
- [ ] Commit/push modifiche `package.json` / `Navbar.tsx` se ancora utili
- [ ] **Non** committare: `.env*`, `*.dump`, secret, CHAT-EXPORT se contiene dati sensibili

> Chiedere conferma prima di commit/push, salvo istruzione diversa.

---

## 3) Dopo i 5 giorni (settimane 2–6)

- [ ] Collegare 1–3 fornitori dropshipping affidabili (EU/IT/US) — **non** CJ come cuore del catalogo
- [ ] Import prodotti (CSV/API/admin) con regole qualità + spedizione di Antonino
- [ ] Checkout Stripe in modalità **test** → poi live
- [ ] Onboarding partner reali (es. TGP) via registrazione vendor
- [ ] Riempire gradualmente lo shop (solo prodotti approvati)

---

## 4) Più avanti (mesi successivi)

- [ ] Cashback + referral (ledger, dashboard cliente)
- [ ] Beneficenza / reportistica
- [ ] Più fornitori marketplace (meno dipendenza dal solo dropshipping)
- [ ] App React Native (login, ordini, cashback)
- [ ] Produzione: hosting stabile, sicurezza, backup, MFA

---

## 5) Fuori scope (non fare ora)

- Catalogo pieno tipo Amazon
- CJ come cuore del catalogo
- Cashback/referral completi nei 5 giorni
- App mobile nei 5 giorni
- Scala Amazon

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

1. ~~Finire la **sezione 0** (avvio sul nuovo PC)~~ ✅  
2. ~~Poi partire dal **Giorno 3**~~ ✅  
3. ~~**Giorno 4** — polish demo locale~~ ✅  
4. **Giorno 5** — collaudo + doc consegna + commit/push (chiedere conferma prima del push)  

Vedi anche: `docs/PIANO-5-GIORNI.md`, `.cursor/HANDOFF.md`, `docs/AVVIO-DEMO.md`, `docs/CHECKLIST-PRIMO-CLICK.md`, `docs/COSA-MOSTRARE-DEMO.md`, `docs/CHECKLIST-COLLAUDO-10MIN.md`
