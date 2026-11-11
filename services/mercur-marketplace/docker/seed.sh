#!/bin/sh
# One-shot demo seed. Do not run on every boot.
# Creates region Europe (includes IT), publishable key, and a demo seller.
# Demo vendor password is in the seed source — change it before real customers.
set -eu
. "$(dirname "$0")/runtime.sh"

require DATABASE_URL REDIS_URL STORE_CORS ADMIN_CORS AUTH_CORS VENDOR_CORS

if [ -f ./src/scripts/seed.js ]; then
  exec $MEDUSA exec ./src/scripts/seed.js
fi
if [ -f ./src/scripts/seed.ts ]; then
  exec $MEDUSA exec ./src/scripts/seed.ts
fi

echo "Script di seed non trovato in src/scripts." >&2
exit 1
