# Blocco 1 — API Mercur online + storefront Vercel

**Data:** 2026-11-11  
**Stack pubblico:** Mercur API (`services/mercur-marketplace`) + storefront (`apps/storefront-next`).  
**Non usare** il prototipo Supabase su `:3000`.  
**Non fare in questo blocco:** DNS, dominio `wheback.com`, cutover, cashback, referral, chiavi Stripe live.

Il codice di deploy è nel repo. I click su Railway e Vercel restano a un umano: questo ambiente non ha gli account e non deve ricevere segreti.

---

## Hosting scelto: Railway

L’API Medusa/Mercur è un processo Node sempre acceso, con Postgres e Redis. Vercel non può ospitarla.

**Railway** è il target di questo blocco perché:

- Postgres e Redis sono plugin nello stesso progetto, con URL privato (`DATABASE_URL`, `REDIS_URL`).
- Il deploy è un Dockerfile già nel repo, con healthcheck su `GET /health`.
- Non serve un cluster, un volume di sistema per il processo, né una rete da disegnare a mano.
- L’URL pubblico temporaneo è `https://<servizio>.up.railway.app`. Il dominio `api.wheback.com` resta fermo.

Render e Fly.io possono eseguire lo stesso Dockerfile. Non sono il percorso documentato qui: Render aggiunge un secondo modello (Blueprint + Key Value), Fly aggiunge macchine e rete privata. Se più avanti si cambia host, il Dockerfile in `services/mercur-marketplace/Dockerfile` resta la base.

Node dell’immagine: **22** (allineato allo storefront e a `engines` `>=20` di Medusa).

---

## Cosa è già nel repo

| Pezzo | Dove |
| --- | --- |
| Dockerfile + avvio (migrate poi start) | `services/mercur-marketplace/Dockerfile`, `docker/start.sh` |
| Seed e admin, solo a comando | `docker/seed.sh`, `docker/create-admin.sh` |
| Config Railway | `services/mercur-marketplace/railway.toml` |
| Env di esempio API | `services/mercur-marketplace/packages/api/.env.example` (copia identica in `.env.template`) |
| Env di esempio storefront | `apps/storefront-next/.env.example` |
| Vercel (vale quando la Root Directory è lo storefront) | `apps/storefront-next/vercel.json`, `.node-version` (`22`) |
| Build storefront inchiodato alla sua cartella | `apps/storefront-next/next.config.ts` (`turbopack.root` e `outputFileTracingRoot`) |
| CI | `.github/workflows/deploy-checks.yml` |

Lo script di avvio esegue `medusa db:migrate --execute-safe-links` e poi `medusa start` in modalità `MEDUSA_WORKER_MODE=shared` (HTTP e worker nello stesso processo). **Una sola replica** in questo blocco: due processi che migrano insieme non sono coperti.

`REDIS_URL` alimenta sessioni, event bus, cache, workflow engine e locking. Senza `STRIPE_API_KEY` il processo parte lo stesso; il provider Stripe si registra solo quando la chiave c’è.

Il seed **non** parte a ogni boot.

---

## Passi manuali — Railway (API)

1. Accedi a Railway con l’account del progetto (Gabriele).
2. New Project → Deploy from GitHub → repo `wheandback-platform`.
3. Sul servizio dell’API, **Settings → Root Directory** = `services/mercur-marketplace`.  
   Railway deve vedere `Dockerfile` e `railway.toml` in quella cartella. Non lasciare la root del monorepo: lì c’è il prototipo Next.
4. Nello stesso progetto aggiungi il plugin **PostgreSQL** e il plugin **Redis**.
5. Collega le variabili al servizio API (reference Railway, non copiare a mano se il pannello offre “Add variable reference”):
   - `DATABASE_URL` = URL **privato** di Postgres
   - `REDIS_URL` = URL **privato** di Redis
6. Genera il dominio pubblico del servizio (`*.up.railway.app`) prima del build che deve andare online. Copia l’origine, senza slash finale. Esempio: `https://wheback-api-production.up.railway.app`.
7. Imposta le variabili della tabella sotto. `MERCUR_BACKEND_URL` entra nel **build** dell’immagine (i pannelli Admin/Vendor ci scrivono l’origine). Se la imposti dopo il primo build, rifai il deploy.
8. Volume (consigliato, altrimenti le immagini prodotto si perdono a ogni redeploy): mount path esatto  
   `/app/.medusa/server/static`  
   Il provider file è quello locale già in `medusa-config.ts`. Non è uno storage S3. Va bene per sbloccare il primo deploy; non regge più di una replica.
9. Deploy. Attendi che il healthcheck `GET /health` sia verde (la prima migrazione può impiegare qualche minuto; il timeout nel repo è 300 secondi).
10. Apri la shell del servizio **una volta** ed esegui il seed demo:
    ```sh
    sh /docker/seed.sh
    ```
    Nei log compare la publishable key (`pk_...`) se è appena stata creata. Copiala: va in `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` su Vercel.  
    Se la chiave esiste già, leggila da `https://<api>/dashboard` → Settings → Publishable API Keys.
11. Crea l’utente admin **una volta**, con una password che non finisce nel repo:
    ```sh
    ADMIN_EMAIL='tu@email' ADMIN_PASSWORD='password-lunga' sh /docker/create-admin.sh
    ```
    La password compare nella riga di comando della shell. Non riusare `supersecret`.
12. Controlla nel browser:
    - `https://<api>/health` → `OK`
    - `https://<api>/dashboard` → login admin
    - `https://<api>/seller` → pannello vendor

### Attenzione sul seed demo

`docker/seed.sh` esegue `packages/api/src/scripts/seed.ts`. Crea la region **Europe** (EUR, include l’Italia), la publishable key, un catalogo demo e il vendor `seller@mercur.dev`. La password di quel vendor è nel sorgente del seed (`supersecret`). Va bene per sbloccare lo shop di prova. **Prima di clienti veri** cambia quella password o non usare questo seed sul database che resterà in produzione.

`DATABASE_SSL`: lasciala `false` con l’URL privato Railway. Se la connessione fallisce per TLS (di solito perché hai incollato l’URL pubblico), imposta `DATABASE_SSL=true` e rideploya. Non committare l’URL.

---

## Variabili API (solo nomi)

Impostale sul servizio Railway. I valori di esempio stanno in `packages/api/.env.example`.

| Nome | Note |
| --- | --- |
| `DATABASE_URL` | URL privato Postgres |
| `DATABASE_SSL` | `false` sull’URL privato; `true` solo se serve TLS |
| `REDIS_URL` | URL privato Redis |
| `JWT_SECRET` | `openssl rand -base64 32`. Vietato `supersecret` e i placeholder dell’example |
| `COOKIE_SECRET` | un’altra stringa casuale, diversa dalla JWT |
| `STORE_CORS` | copia il valore dell’example (localhost + regex `*.vercel.app`) |
| `ADMIN_CORS` | localhost admin; in produzione i pannelli sono sulla stessa origine dell’API |
| `VENDOR_CORS` | come sopra, per il vendor |
| `AUTH_CORS` | deve includere lo storefront (localhost e la regex Vercel) |
| `MERCUR_BACKEND_URL` | origine pubblica `https://<servizio>.up.railway.app` — **build** |
| `MERCUR_VENDOR_URL` | `https://<servizio>.up.railway.app/seller` |
| `FILE_BACKEND_URL` | `https://<servizio>.up.railway.app/static` |
| `MEDUSA_WORKER_MODE` | `shared` |
| `NODE_ENV` | `production` (l’immagine la imposta già) |
| `STRIPE_API_KEY` | opzionale. Se è vuota l’API parte senza il provider Stripe. Con la chiave, va abilitato sulla Region |
| `STRIPE_WEBHOOK_SECRET` | opzionale, insieme alla chiave Stripe |
| `ALLOW_INSECURE_SECRETS` | **non impostare**. Se vale `true` il processo accetta i placeholder |

`PORT` la inietta Railway. Non fissarla a 9000 sul servizio.

### CORS — copia il valore, non inventare il glob

Medusa non accetta la stringa `https://*.vercel.app`. Accetta origini esatte e una regex delimitata (qui il delimitatore è `@`, senza flag `g`). Il valore in `.env.example` permette:

- `http://localhost:3002` e `http://127.0.0.1:3002`
- ogni `https://<nome>.vercel.app` (preview e production del progetto Vercel)

Non aggiunge `https://wheback.com`: quello è il cutover DNS, fuori da questo blocco. Quando arriverà, si aggiungono le origini esatte a `STORE_CORS` e `AUTH_CORS` e si rideploya l’API.

Incolla il valore **senza virgolette** nel pannello Railway.

---

## Passi manuali — Vercel (storefront)

Il `vercel.json` nella root del repo è il cron del prototipo Supabase. Non deve essere il progetto pubblico.

1. Vercel → progetto dello storefront (o New Project sullo stesso repo).
2. **Settings → General → Root Directory** = `apps/storefront-next`.  
   Framework Next.js. Install `npm ci`, build `npm run build` (già in `apps/storefront-next/vercel.json`). Node **22** (file `.node-version`).
3. Environment Variables (Production e Preview):

| Nome | Valore |
| --- | --- |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://<servizio>.up.railway.app` (senza slash finale) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_...` copiata dal seed o dall’admin |
| `NEXT_PUBLIC_DEFAULT_REGION_COUNTRY` | `it` |
| `NEXT_PUBLIC_STRIPE_PK` | vuota, oppure `pk_test_...` se stai provando Stripe |

4. Redeploy. Le `NEXT_PUBLIC_*` entrano nel build: cambiarle richiede un nuovo deploy.
5. Apri `https://<progetto>.vercel.app/it` e `/it/shop`. Lo shop deve leggere i prodotti dall’API Railway, non da `localhost`.

Lo storefront sceglie la region Medusa che contiene il paese `it` (il seed crea “Europe”, EUR, con l’Italia dentro). Se non la trova, usa la region EUR.

---

## Verifica già coperta dal codice

Eseguita in locale l’11 novembre 2026: build storefront verde con `.env.example`; API con build di produzione, migrazioni, connessione Redis e `GET /health` = 200.

In locale o in CI (`.github/workflows/deploy-checks.yml`):

- storefront: `npm ci` + `npm run build` con `apps/storefront-next/.env.example`
- API: build di produzione, `npm install` dell’artifact `.medusa/server`, migrazione, `medusa start`, `GET /health` = 200

Comandi, dalla root del repo, con Postgres e Redis accesi:

```sh
cd apps/storefront-next
npm ci
set -a && source .env.example && set +a
npm run build

cd ../../services/mercur-marketplace
DATABASE_URL=postgres://wheback:wheback_dev@localhost:5433/wheback_medusa \
REDIS_URL=redis://localhost:6379 \
ALLOW_INSECURE_SECRETS=true \
bash scripts/verify-prod-boot.sh
```

Il Postgres di `infrastructure/docker/docker-compose.yml` è sulla porta **5433**.

---

## Cosa resta dopo questo blocco

- Creare davvero il servizio Railway e incollare le env (questo documento).
- Impostare la Root Directory Vercel e le quattro env pubbliche.
- Eseguire seed + admin una volta sull’API online.
- Stripe test end-to-end contro l’API pubblica, webhook HTTPS, spedizione, email ordine.
- Pagine legali e dati società.
- **Non ora:** DNS GoDaddy, `wheback.com`, `api.wheback.com`, Stripe live, cashback, referral.

Riferimenti: `PERCORSO-PUBBLICAZIONE-STEP-BY-STEP.md` (step 6–8), `DOMINIO-GODADDY-VERCEL.md` (solo quando gli step precedenti sono verdi).
