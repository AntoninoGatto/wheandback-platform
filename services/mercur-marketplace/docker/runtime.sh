#!/bin/sh
# Shared by the production entrypoints. Sourced, not executed.
set -eu

if [ -n "${MEDUSA_SERVER_DIR:-}" ]; then
  cd "$MEDUSA_SERVER_DIR"
elif [ -d /app/.medusa/server ]; then
  cd /app/.medusa/server
else
  echo "MEDUSA_SERVER_DIR non impostata e /app/.medusa/server assente." >&2
  exit 1
fi

if [ "${ALLOW_INSECURE_SECRETS:-}" != "true" ]; then
  export ENFORCE_PROD_SECRETS=true
fi

export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-9000}"
export NODE_ENV="${NODE_ENV:-production}"
export MEDUSA_WORKER_MODE="${MEDUSA_WORKER_MODE:-shared}"

# /app is root-owned. Tools such as npm follow HOME and otherwise try to
# mkdir /app/.config, which EACCES-crashes the non-root user.
if [ -z "${HOME:-}" ] || [ ! -w "${HOME}" ]; then
  export HOME=/home/medusa
fi
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
mkdir -p "$XDG_CONFIG_HOME"

require() {
  for name in "$@"; do
    eval "value=\${$name-}"
    if [ -z "$value" ]; then
      echo "Variabile obbligatoria mancante: $name" >&2
      exit 1
    fi
  done
}

if [ -x ./node_modules/.bin/medusa ]; then
  MEDUSA=./node_modules/.bin/medusa
else
  MEDUSA="npx medusa"
fi
