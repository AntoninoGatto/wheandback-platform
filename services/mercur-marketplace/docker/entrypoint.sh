#!/bin/sh
# Container entrypoint. Railway starts this as root (image default). It prepares
# a writable home for uid 1001, fixes the uploads volume, then drops privileges.
# The Medusa process itself is never left running as root.
set -eu

export HOME=/home/medusa
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-/home/medusa/.config}"

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$HOME" "$XDG_CONFIG_HOME" /app/.medusa/server/static
  # The static path is a Railway volume mount. A fresh mount is root-owned;
  # chown lets uid 1001 write it. Do not set RAILWAY_RUN_UID=0.
  chown -R medusa:medusa "$HOME" "$XDG_CONFIG_HOME" /app/.medusa/server/static
  exec runuser --preserve-environment -u medusa -- /docker/start.sh
fi

mkdir -p "$XDG_CONFIG_HOME" /app/.medusa/server/static
exec /docker/start.sh
