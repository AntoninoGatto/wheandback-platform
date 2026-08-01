# Avvio demo Whe&Back® (locale)

**Path progetto (questo PC):** `C:\Progetti\wheback-platform`  
**Stack da usare:** Mercur (`:9000`) + storefront Next (`:3002`)  
**Non usare per la demo nuova:** prototipo root su `:3000` (freeze / solo reference)

Windows: preferisci `npm.cmd` se `npm` dà errori di ExecutionPolicy.

---

## Prima di chiamare papà (30 secondi)

Usa la checklist spuntabile: `docs/CHECKLIST-PRIMO-CLICK.md`

1. Docker Desktop aperto → Engine **running**
2. Due terminali con Mercur e storefront avviati
3. Apri http://localhost:3002/it/istruzioni

---

## Avvio passo-passo

### 1) Docker (Postgres + Redis)

```powershell
cd C:\Progetti\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

Attendi che i container siano healthy:

```powershell
docker ps
```

Devi vedere `wheback-postgres` e `wheback-redis`.

**Nota porte (importante su questo PC):**
- Postgres Docker è su host **5433** (la 5432 è spesso occupata da PostgreSQL Windows)
- Redis su **6379**
- In `services/mercur-marketplace/packages/api/.env` la `DATABASE_URL` deve puntare a `localhost:5433`

### 2) Pannelli admin/vendor (solo se mancano)

Se `/seller` o `/dashboard` non caricano bene:

```powershell
cd C:\Progetti\wheback-platform
npm.cmd run build:mercur-panels
```

### 3) Mercur (terminale 1)

```powershell
cd C:\Progetti\wheback-platform
npm.cmd run dev:mercur
```

Attendi: `Server is ready on port: 9000`

### 4) Storefront (terminale 2)

```powershell
cd C:\Progetti\wheback-platform
npm.cmd run dev:storefront
```

Attendi: ready su porta **3002**

---

## URL da aprire (demo)

| Cosa | URL |
|------|-----|
| **Istruzioni (parti da qui)** | http://localhost:3002/it/istruzioni |
| Sito / home | http://localhost:3002/it |
| Shop | http://localhost:3002/it/shop |
| Fornitori (vendor) | http://localhost:9000/seller |
| Registrazione fornitore | http://localhost:9000/seller/register |
| Admin | http://localhost:9000/dashboard |

Flusso consigliato in 4 passi: è scritto anche nella pagina Istruzioni.

---

## Se qualcosa non parte

| Sintomo | Cosa controllare |
|---------|------------------|
| Mercur non parte / errori DB | Docker up? `DATABASE_URL` su porta **5433**? |
| Shop errore / catalogo non disponibile | Mercur ready su 9000? Esiste `apps/storefront-next/.env.local`? |
| `/seller` o `/dashboard` vuoti | Rifai `npm.cmd run build:mercur-panels` |
| Porta 3002 occupata | Chiudi altro `next dev` oppure riavvia lo storefront |

**Non incollare valori di `.env*` in chat o in commit.**

---

## Stop (fine demo)

Nei due terminali: `Ctrl+C`.  
Docker può restare acceso, oppure:

```powershell
cd C:\Progetti\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml stop
```

---

Vedi anche: `docs/TO-DO-LIST-progetto-wheback.md`, `docs/PIANO-5-GIORNI.md`, `.cursor/HANDOFF.md`
