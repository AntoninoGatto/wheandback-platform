# FASE 1 — Guida operativa (Medusa + Mercur)

**Stato:** ✅ COMPLETATA (2026-07-13)  
**Approvato da:** Antonino Gatti (2026-06-24)  
**Stack:** Medusa.js + Mercur + Next.js + React Native (Expo) + PostgreSQL + Redis

---

## Cosa abbiamo fatto in Fase 1

1. Installato **Docker Desktop** (PostgreSQL + Redis locali)
2. Creato il **backend marketplace Mercur** (`services/mercur-marketplace`)
3. Organizzato lo **scheletro monorepo** (`apps/`, `services/`, `packages/`, `infrastructure/`)
4. Verificato **API + admin + vendor panel** in locale (porta 9000)
5. Mantenuto il **prototipo Next.js + Supabase** su `:3000` per demo

---

## Avvio rapido (dopo ogni riavvio PC)

### 1. Docker

Apri **Docker Desktop** e attendi **Engine running**, poi:

```powershell
cd C:\Users\Nino\Desktop\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### 2. Build pannelli (solo la prima volta, o dopo `git pull`)

`dev:api` avvia solo il backend. Admin e vendor vanno **compilati** prima:

```powershell
cd C:\Users\Nino\Desktop\wheback-platform\services\mercur-marketplace
npm.cmd run build:panels
```

Richiede ~1 minuto. I file finiscono in `apps/admin/dist` e `apps/vendor/dist` (non su GitHub — sono in `.gitignore`).

### 3. Avvia Mercur API

```powershell
cd C:\Users\Nino\Desktop\wheback-platform\services\mercur-marketplace
npm.cmd run dev:api
```

Attendi: `Server is ready on port: 9000`

### 4. Browser

| Servizio | URL |
|----------|-----|
| Admin (operatore) | http://localhost:9000/dashboard |
| Vendor (fornitori) | http://localhost:9000/seller |
| API | http://localhost:9000 |

### 5. Primo account admin (una tantum)

Se non esiste ancora un admin, in un **secondo** terminale:

```powershell
cd C:\Users\Nino\Desktop\wheback-platform\services\mercur-marketplace\packages\api
npx medusa user --email TUO_EMAIL@esempio.com --password "TuaPasswordSicura123!"
```

Poi accedi su http://localhost:9000/dashboard/login

> La pagina di login **non** crea account: serve solo per utenti già creati via CLI.

---

## Step 1 — Installa Docker Desktop (obbligatorio)

Mercur ha bisogno di **PostgreSQL** e **Redis**. Su Windows il modo più semplice è Docker.

1. Vai su **https://www.docker.com/products/docker-desktop/**
2. Scarica **Docker Desktop for Windows**
3. Installa e **riavvia il PC**
4. Apri Docker Desktop e attendi che dica **Running**
5. Verifica nel terminale:

```powershell
docker --version
docker compose version
```

---

## Step 2 — Avvia database locale

```powershell
cd C:\Users\Nino\Desktop\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

PostgreSQL → porta `5432`  
Redis → porta `6379`

---

## Step 3 — Crea il progetto Mercur

```powershell
cd C:\Users\Nino\Desktop\wheback-platform
npx @mercurjs/cli@2.1.6 create services/mercur-marketplace --db-connection-string "postgres://wheback:wheback_dev@localhost:5432/wheback_medusa"
```

> Usa la versione **2.1.6** del CLI (`@latest` può dare `unknown command create`).

---

## Step 4 — Avvia Mercur

**Su Windows:** non usare `npm run dev` (turbo) — può fallire con `virtual:medusa/layouts`.

Usa invece:

```powershell
npm.cmd run build:panels   # prima volta o dopo aggiornamenti
npm.cmd run dev:api        # backend + serve i pannelli su :9000
```

---

## Step 5 — Struttura monorepo

```text
wheandback-platform/
  apps/                    ← placeholder (storefront e mobile in Fase 2+)
  services/
    mercur-marketplace/    ← backend Medusa + Mercur
  packages/                ← placeholder (tipi condivisi, UI)
  infrastructure/
    docker/                ← PostgreSQL + Redis
  docs/
```

Il prototipo attuale resta nella **root** finché non migriamo pagina per pagina in `apps/storefront-next/` (Fase 2).

---

## Step 6 — Cosa migrare dal prototipo (Fase 2+)

| Prototipo | Destinazione Mercur |
|-----------|---------------------|
| Componenti UI brand | `packages/ui-components` |
| `messages/*.json` | storefront Next.js |
| Regole cashback/referral | modulo custom Medusa |
| Import CJ | `supplier-import-service` |
| Onboarding partner TGP | Mercur vendor + workflow custom |

---

## Regole durante Fase 1

- Il sito **localhost:3000** (prototipo) resta per demo
- **Non** aggiungere feature al prototipo salvo bug critici
- Non committare mai `.env` o `.env.local`
- I build `dist/` dei pannelli sono locali — rigenerarli con `npm.cmd run build:panels`

---

## Problemi comuni

| Problema | Soluzione |
|----------|-----------|
| `ERR_CONNECTION_REFUSED` su :9000 | Mercur non avviato → `npm.cmd run dev:api` |
| `Dashboard not built` | Manca build → `npm.cmd run build:panels` |
| Login non fa nulla | Nessun admin nel DB → `npx medusa user --email ... --password ...` |
| `docker` non riconosciuto | Installa Docker Desktop e riavvia PC |
| `EADDRINUSE` porta 9000 | Chiudi il processo Mercur vecchio o riavvia il terminale |
| Memoria insufficiente | Chiudi altri programmi; un solo `npm run dev` alla volta |
| Porta 5432 occupata | Ferma altri PostgreSQL o cambia porta in docker-compose |

---

## Prossimo passo: Fase 2

Vedi [`docs/ROADMAP.md`](ROADMAP.md). **Attendere OK esplicito di Antonino** prima di iniziare.

---

*Aggiornato al completamento Fase 1 — 2026-07-13.*
