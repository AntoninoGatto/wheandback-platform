# Transfer DB — Postgres Medusa/Mercur

Il volume Docker `wheback_postgres_data` **non** viene copiato con la cartella progetto.  
Prima di spostare la SSD, se ti serve lo stesso catalogo/seller demo, crea un dump qui.

## Dump (PC attuale — Docker Desktop acceso)

```powershell
cd C:\Users\Nino\Desktop\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml up -d
.\.cursor\transfer\dump-db.ps1
```

Output atteso: `.cursor/transfer/wheback_medusa.dump` (gitignored).

## Restore (nuovo PC)

```powershell
cd <PATH>\wheback-platform
docker compose -f infrastructure/docker/docker-compose.yml up -d
# attendi healthy
.\.cursor\transfer\restore-db.ps1
```

Poi riavvia Mercur (`npm.cmd run dev:mercur`).

## Se non fai dump

Sul nuovo PC il DB sarà vuoto: dovrai ricreare admin user, publishable key, seller, prodotti.  
Il codice e gli `.env*` bastano per far partire lo stack, non i dati.
