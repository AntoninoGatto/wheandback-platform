#!/bin/sh
# Migrate (safe, non-interactive) then start one shared server+worker process.
set -eu
. "$(dirname "$0")/runtime.sh"

require DATABASE_URL REDIS_URL STORE_CORS ADMIN_CORS AUTH_CORS VENDOR_CORS

echo "Mercur: migrazioni (execute-safe-links)..."
$MEDUSA db:migrate --execute-safe-links
echo "Mercur: avvio su ${HOST}:${PORT}..."
exec $MEDUSA start
