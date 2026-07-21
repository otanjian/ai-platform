#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "Stopping AI Platform local services..."

for pidfile in .gateway.pid .frontend.pid .taskview-api.pid .taskview-web.pid; do
  if [ -f "$pidfile" ]; then
    kill "$(cat "$pidfile")" 2>/dev/null || true
    rm -f "$pidfile"
  fi
done

# Superset is Docker-managed; leave it running unless explicitly stopped:
#   (cd ../superset && docker compose down)

echo "Stopped gateway / frontend / TaskView."
echo "(Superset stack left running if started separately; DataEase is no longer part of the platform.)"
