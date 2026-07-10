# FASE 1 — Guida operativa (Medusa + Mercur)

**Stato:** in corso  
**Approvato da:** Antonino Gatti (2026-06-24)  
**Stack:** Medusa.js + Mercur + Next.js + React Native (Expo) + PostgreSQL + Redis

---

## Cosa facciamo in Fase 1

1. Installare **Docker Desktop** (PostgreSQL + Redis locali)
2. Creare il **backend marketplace Mercur** accanto al prototipo
3. Organizzare il **monorepo** (cartelle `apps/` e `services/`)
4. Verificare che backend + admin + vendor panel partano in locale
5. **Non** spegnere ancora il prototipo Next.js + Supabase (resta per demo)

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

Dalla cartella del progetto:

```powershell
cd C:\Users\Nino\Desktop\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

PostgreSQL → porta `5432`  
Redis → porta `6379`

---

## Step 3 — Crea il progetto Mercur

Mercur fornisce un CLI che crea il marketplace completo (Medusa + vendor panel + admin).

```powershell
cd C:\Users\Nino\Desktop\wheback-platform
npx @mercurjs/cli@2.1.6 create services/mercur-marketplace --db-connection-string "postgres://wheback:wheback_dev@localhost:5432/wheback_medusa"
```

> Usa la versione **2.1.6** del CLI (`@latest` può dare `unknown command create`).

---

## Step 4 — Avvia Mercur

**Importante:** usa solo il backend API (admin e vendor sono su porta 9000).

```powershell
cd C:\Users\Nino\Desktop\wheback-platform\services\mercur-marketplace
npm.cmd run dev:api
```

Verifica nel browser:

| Servizio | URL |
|----------|-----|
| Backend + Admin | http://localhost:9000/dashboard |
| Pannello fornitori | http://localhost:9000/seller |

> Non usare `npm run dev` (turbo) su Windows finché non serve: avvia anche :7000/:7001 che possono dare errore `virtual:medusa/layouts`. L'API su :9000 è sufficiente per Fase 1.

---

## Step 5 — Struttura monorepo (obiettivo)

```text
wheandback-platform/
  apps/
    storefront-next/       ← prototipo Next.js (spostamento graduale)
    mobile-app/            ← React Native Expo (Fase 5)
  services/
    mercur-marketplace/    ← backend Medusa + Mercur (Step 3)
  packages/
    shared-types/
    ui-components/
  infrastructure/
    docker/
  docs/
```

Il prototipo attuale resta nella **root** finché non migriamo pagina per pagina in `apps/storefront-next/`.

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
- Ogni progresso Fase 1 → commit su branch `develop` + push GitHub
- Non committare mai `.env` o `.env.local`

---

## Problemi comuni

| Problema | Soluzione |
|----------|-----------|
| `docker` non riconosciuto | Installa Docker Desktop e riavvia PC |
| Memoria insufficiente | Chiudi altri programmi; un solo `npm run dev` alla volta |
| Porta 5432 occupata | Ferma altri PostgreSQL o cambia porta in docker-compose |

---

*Aggiornare questo file ad ogni step completato.*
