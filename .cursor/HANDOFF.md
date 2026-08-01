# Whe&Back® — HANDOFF (SSD-first)

**Progetto:** `wheback-platform`  
**Path tipico (PC attuale):** `C:\Users\Nino\Desktop\wheback-platform`  
**Strategia:** copia cartella su SSD → disco nuovo PC → Open Folder in Cursor. Git è solo allineamento dopo.  
**Aggiornato:** 2026-07-29

---

## 1) Stato git (PC attuale)

| Voce | Valore |
|------|--------|
| Repo | Sì |
| Remote | `origin` → `https://github.com/AntoninoGatto/wheandback-platform.git` |
| Branch attivo | `develop` (track `origin/develop`) |
| Ultimo commit remoto allineato | `736d1bc` — docs Fase 1 / Mercur |
| Commit locali non pushati | **Nessuno** (branch non ahead) |
| Lavoro NON committato | **Sì — critico** (vedi sotto) |

### Lavoro locale non su GitHub (DEVE viaggiare nella cartella)

Non affidarti a `git clone` / `git pull` per questo pezzo:

- `apps/storefront-next/` (intero storefront Next + Medusa client)
- `services/mercur-marketplace/packages/api/src/workflows/hooks/` (auto `product_seller` / store visibility)
- `services/mercur-marketplace/packages/api/src/scripts/setup-new1-seller.ts`
- `services/mercur-marketplace/packages/api/src/scripts/backfill-product-store-visibility.ts`
- `docs/PIANO-5-GIORNI.md`
- modifiche: `package.json`, `src/components/layout/Navbar.tsx`

**Prima del trasferimento:** idealmente commit+push di questo lavoro (senza `.env*`). Se non puoi pushare, la cartella SSD è l’unica fonte di verità.

---

## 2) Cosa DEVE stare nella cartella copiata

### Critico (non è su Git / non si ricrea da solo)

| Path | Perché |
|------|--------|
| `.env.local` (root) | Secret prototipo Supabase/Stripe/OpenAI/CJ |
| `apps/storefront-next/.env.local` | `NEXT_PUBLIC_MEDUSA_*` (publishable key) |
| `services/mercur-marketplace/packages/api/.env` | DB/Redis/JWT/CORS Mercur |
| Tutto il lavoro untracked/modified sopra | Altrimenti perdi storefront + fix shop |
| `.cursor/HANDOFF.md` | Questa guida |
| `.cursor/CHAT-EXPORT-*.md` | Contesto chat operativo |
| `.cursor/transfer/*.sql` (se creato) | Dump Postgres Medusa (seller/prodotti demo) |

### Utile ma ricostruibile

| Path | Note |
|------|------|
| `node_modules/` (root + storefront + mercur) | ~1.8 GB totale — opzionale sulla SSD |
| `.next/` | Cache build — meglio escludere e rebuild |
| `services/mercur-marketplace/packages/api/.medusa/` | Generato; si ricrea con `dev`/`build` |

### Fuori dalla cartella (rischio #1)

Il database Medusa **non** è nella cartella progetto: è il volume Docker `wheback_postgres_data`.

Senza dump, sul nuovo PC riparti con DB vuoto (niente seller New1, niente “prodotto prova wheback”, niente publishable key già collegata ai sales channel nello stesso modo).

---

## 3) Cosa NON conviene copiare (pesante)

Stime PC attuale:

- `node_modules` root ≈ 711 MB  
- `apps/storefront-next/node_modules` ≈ 433 MB  
- `services/mercur-marketplace/node_modules` ≈ 658 MB  
- `.next` root ≈ 71 MB + storefront `.next` ≈ 349 MB  

**Raccomandazione SSD:** escludere `node_modules` e `.next`, poi reinstall sul nuovo PC.  
Se vuoi offline-first (senza rete), copia anche `node_modules` (cartella più grande).

Esempio Robocopy **senza** pesi (PowerShell):

```powershell
robocopy "C:\Users\Nino\Desktop\wheback-platform" "E:\wheback-platform" /E /XD node_modules .next .git\cursor-tmp /XF "*.log" /R:2 /W:2 /MT:8
```

> Se escludi `.git` per errore, perdi storia git: **non escludere `.git`**.

---

## 4) Stack e comandi

### Runtime sul nuovo PC

- **Node.js** 20+ (qui c’era v24.16.0) + npm  
- **Docker Desktop** (Postgres 16 + Redis 7)  
- **Cursor**  
- Windows: usare `npm.cmd` se ExecutionPolicy blocca `npm`

### Porte

| Servizio | URL / porta |
|----------|-------------|
| Prototipo Next (root, freeze demo) | `http://localhost:3000` |
| Storefront Mercur | `http://localhost:3002` |
| Mercur API / Admin / Vendor | `http://localhost:9000` (`/dashboard`, `/seller`) |
| Postgres | `5432` |
| Redis | `6379` |

### Comandi standard

```powershell
# 1) DB
cd <PATH>\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 2) (se hai dump) ripristina — vedi .cursor/transfer/README.md

# 3) Dipendenze (se non hai copiato node_modules)
npm.cmd install
npm.cmd install --prefix apps/storefront-next
npm.cmd install --prefix services/mercur-marketplace

# 4) Pannelli vendor/admin (se mancano build)
npm.cmd run build:mercur-panels

# 5) Mercur API
npm.cmd run dev:mercur

# 6) Storefront
npm.cmd run dev:storefront
```

### Env da verificare (solo nomi — mai incollare valori in chat)

- Root `.env.local`: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, Stripe, `CJ_API_KEY`, `OPENAI_API_KEY`, `CRON_SECRET`
- Storefront: `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- Mercur API `.env`: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, CORS (`STORE_CORS` deve includere `http://localhost:3002`)

Template Mercur: `services/mercur-marketplace/packages/api/.env.template`

---

## 5) Contesto prodotto (dove eravamo)

- Piano 5 giorni: Giorno 1–2 fatti (storefront + flusso vendor e2e).  
- Fix shop: hook auto `product_seller` + sales channel in `packages/api/src/workflows/hooks/product-store-visibility.ts`.  
- Prototipo root `:3000` resta freeze; lavoro reale = Mercur `:9000` + storefront `:3002`.  
- Docs: `docs/PIANO-5-GIORNI.md`, `docs/ROADMAP.md`, `AGENTS.md`.

---

## 6) Transcript chat

Le transcript Cursor vivono **fuori** dal repo:

`C:\Users\Nino\.cursor\projects\c-Users-Nino-Desktop-wheback-platform\agent-transcripts\`

Per portarle sulla SSD **manualmente** (opzionale):

```powershell
robocopy "C:\Users\Nino\.cursor\projects\c-Users-Nino-Desktop-wheback-platform\agent-transcripts" "C:\Users\Nino\Desktop\wheback-platform\.cursor\transcripts-raw" /E
```

Poi usa `.cursor/CHAT-EXPORT-2026-07-29.md` (sintesi leggibile, senza secret).

---

## 7) Prima Agent chat sul nuovo PC

Apri la cartella in Cursor → Trust → nuova chat Agent con:

```text
@HANDOFF.md @CHAT-EXPORT-2026-07-29.md
Sto riprendendo wheback-platform su nuovo PC dopo trasferimento SSD-first (cartella copiata, non clone).
Leggi i file @, verifica che .env* ci siano (senza stamparne i valori), poi dimmi: (1) cosa manca, (2) comandi esatti per Docker + install + dev:mercur + dev:storefront, (3) se serve ripristinare il dump in .cursor/transfer.
```

---

## 8) Git sul nuovo PC (secondario)

```powershell
cd <PATH>\wheback-platform
git status
git remote -v
git pull origin develop
```

Se `git pull` conflicta col lavoro locale non pushato: **non fare reset**. La cartella SSD vince; risolvi a mano o chiedi all’agent.
