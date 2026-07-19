#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

launchctl unload ~/Library/LaunchAgents/com.opencode.gateway.plist 2>/dev/null || true

if [ -d "$ROOT/keycloak" ]; then
  cd "$ROOT/keycloak"
  docker compose down 2>/dev/null || true
fi

echo "Gateway and Keycloak stopped."
