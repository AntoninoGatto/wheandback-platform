#!/usr/bin/env bash
# Production-shaped boot: build, install the .medusa/server artifact outside the
# workspace, migrate, start, and require GET /health = 200.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${REDIS_URL:?REDIS_URL is required}"

export MERCUR_BACKEND_URL="${MERCUR_BACKEND_URL:-http://127.0.0.1:9000}"
export ALLOW_INSECURE_SECRETS="${ALLOW_INSECURE_SECRETS:-true}"
export JWT_SECRET="${JWT_SECRET:-ci-only-not-production}"
export COOKIE_SECRET="${COOKIE_SECRET:-ci-only-not-production-cookie}"
export STORE_CORS="${STORE_CORS:-http://localhost:3002,http://127.0.0.1:3002,http://localhost:8000,@^https://[a-zA-Z0-9.-]+\\.vercel\\.app\$@}"
export ADMIN_CORS="${ADMIN_CORS:-http://localhost:7000,http://localhost:9000}"
export VENDOR_CORS="${VENDOR_CORS:-http://localhost:7001,http://localhost:9000}"
export AUTH_CORS="${AUTH_CORS:-http://localhost:3002,http://127.0.0.1:3002,http://localhost:8000,http://localhost:7000,http://localhost:7001,http://localhost:9000,@^https://[a-zA-Z0-9.-]+\\.vercel\\.app\$@}"
export FILE_BACKEND_URL="${FILE_BACKEND_URL:-http://127.0.0.1:9000/static}"
export MEDUSA_WORKER_MODE="${MEDUSA_WORKER_MODE:-shared}"
export PORT="${PORT:-9000}"
export HOST="${HOST:-127.0.0.1}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=3072}"
export TURBO_UI=stream
export CI=true

if [[ ! -d node_modules/@medusajs/cli ]]; then
  env -u NODE_ENV npm ci
fi

node scripts/check-cors-example.mjs

export NODE_ENV=production
npm run build

STAGE="$(mktemp -d)"
PID=""
cleanup() {
  if [[ -n "$PID" ]]; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  fi
  if [[ -n "$STAGE" ]]; then
    rm -rf "$STAGE"
  fi
}
trap cleanup EXIT

cp -a packages/api/.medusa/server/. "$STAGE/"
(
  cd "$STAGE"
  npm install --omit=dev
)

export MEDUSA_SERVER_DIR="$STAGE"
LOG="${TMPDIR:-/tmp}/wheback-api-boot.log"
bash "$ROOT/docker/start.sh" >"$LOG" 2>&1 &
PID=$!

for _ in $(seq 1 120); do
  if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null; then
    echo "Mercur /health ok on port ${PORT}"
    exit 0
  fi
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "Mercur exited before /health" >&2
    cat "$LOG" >&2
    exit 1
  fi
  sleep 5
done

echo "Timed out waiting for /health" >&2
cat "$LOG" >&2
exit 1
