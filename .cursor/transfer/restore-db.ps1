# Restore wheback_medusa from .cursor/transfer dump (local only)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$dump = Join-Path $PSScriptRoot "wheback_medusa.dump"
if (-not (Test-Path $dump)) { throw "Missing dump: $dump — run dump-db.ps1 on the old PC first." }

Write-Host "Project root: $root"
Write-Host "Restoring from: $dump"

docker compose -f (Join-Path $root "infrastructure\docker\docker-compose.yml") up -d
Start-Sleep -Seconds 5

docker cp $dump wheback-postgres:/tmp/wheback_medusa.dump
# Drop+recreate public schema is destructive — only for local transfer
docker exec wheback-postgres psql -U wheback -d wheback_medusa -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO wheback; GRANT ALL ON SCHEMA public TO public;"
docker exec wheback-postgres pg_restore -U wheback -d wheback_medusa --no-owner --role=wheback /tmp/wheback_medusa.dump
docker exec wheback-postgres rm -f /tmp/wheback_medusa.dump

Write-Host "OK restore. Restart Mercur (npm.cmd run dev:mercur)."
