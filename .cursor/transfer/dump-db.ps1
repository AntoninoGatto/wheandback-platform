# Dump wheback_medusa into .cursor/transfer (local only)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$out = Join-Path $PSScriptRoot "wheback_medusa.dump"
Write-Host "Project root: $root"
Write-Host "Dumping to: $out"

docker compose -f (Join-Path $root "infrastructure\docker\docker-compose.yml") up -d
Start-Sleep -Seconds 3

docker exec wheback-postgres pg_dump -U wheback -d wheback_medusa -Fc -f /tmp/wheback_medusa.dump
docker cp wheback-postgres:/tmp/wheback_medusa.dump $out
docker exec wheback-postgres rm -f /tmp/wheback_medusa.dump

if (-not (Test-Path $out)) { throw "Dump failed: $out not created" }
Write-Host "OK dump:" (Get-Item $out).Length "bytes"
