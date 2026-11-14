#!/bin/sh
# One-shot admin user. Password is passed to the Medusa CLI (visible in the process list).
# Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... sh /docker/create-admin.sh
set -eu
. "$(dirname "$0")/runtime.sh"

require DATABASE_URL REDIS_URL STORE_CORS ADMIN_CORS AUTH_CORS VENDOR_CORS

if [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "Imposta ADMIN_EMAIL e ADMIN_PASSWORD." >&2
  exit 1
fi

exec $MEDUSA user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD"
