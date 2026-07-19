#!/usr/bin/env bash
set -e

echo "Stopping AI Platform local services..."

if [ -f .gateway.pid ]; then
  kill "$(cat .gateway.pid)" 2>/dev/null || true
  rm .gateway.pid
fi

if [ -f .frontend.pid ]; then
  kill "$(cat .frontend.pid)" 2>/dev/null || true
  rm .frontend.pid
fi

echo "Stopped."
