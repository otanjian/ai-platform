#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start Keycloak
if [ -d "$ROOT/keycloak" ]; then
  cd "$ROOT/keycloak"
  docker compose up -d
fi

# Start gateway
cd "$ROOT/gateway"
exec bun run src/index.ts
