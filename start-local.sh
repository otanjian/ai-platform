#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
TASKVIEW_ROOT="$(cd "$ROOT/../TaskView" && pwd)"
SUPERSET_ROOT="$(cd "$ROOT/../superset" && pwd)"

echo "Starting AI Platform locally..."
echo "(DataEase is intentionally skipped; TaskView + Superset are required.)"

# Ensure MySQL and Redis are reachable
mysqladmin ping -h localhost -P 3306 --silent || {
  echo "MySQL is not reachable on localhost:3306. Please start MySQL first."
  exit 1
}
redis-cli ping > /dev/null 2>&1 || {
  echo "Redis is not reachable on localhost:6379. Please start Redis first."
  exit 1
}

# Ensure Keycloak is reachable (start via keycloak/docker-compose if needed)
if ! curl -sf http://localhost:8080/realms/aiplatform/.well-known/openid-configuration > /dev/null; then
  echo "Keycloak is not reachable on localhost:8080. Starting Keycloak..."
  (cd "$ROOT/keycloak" && docker compose up -d)
  for i in $(seq 1 60); do
    if curl -sf http://localhost:8080/realms/aiplatform/.well-known/openid-configuration > /dev/null; then
      echo "Keycloak ready."
      break
    fi
    sleep 2
  done
  curl -sf http://localhost:8080/realms/aiplatform/.well-known/openid-configuration > /dev/null || {
    echo "Keycloak failed to become ready on localhost:8080."
    exit 1
  }
fi

# Start Superset local stack (UI :9060 / API :9068 / Redis :9063)
if ! lsof -i :9068 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Starting Superset local stack (9060/9068/9063)..."
  bash "$SUPERSET_ROOT/local_home/start-all.sh"
fi

# Start TaskView API (:1401) and web (:5174) if needed
# Ensure PLATFORM_SSO_SECRET matches gateway/config.yaml
export PLATFORM_SSO_SECRET="${PLATFORM_SSO_SECRET:-aiplatform-taskview-sso-secret}"
if ! lsof -i :1401 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Starting TaskView API on port 1401..."
  (cd "$TASKVIEW_ROOT" && PLATFORM_SSO_SECRET="$PLATFORM_SSO_SECRET" pnpm dev:api) &
  echo $! > "$ROOT/.taskview-api.pid"
fi
if ! lsof -i :5174 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Starting TaskView web on port 5174..."
  (cd "$TASKVIEW_ROOT" && pnpm dev:webapp) &
  echo $! > "$ROOT/.taskview-web.pid"
fi

# Optional subsystems (do not fail startup if missing)
# OpenCode :4096, BuildingAI :4090/:4091 — start only when already available / separately requested
# DataEase :8100 — intentionally NEVER started

cd "$ROOT/gateway"
if [ ! -f config.yaml ]; then
  cp config.example.yaml config.yaml
  echo "Created gateway/config.yaml from example."
fi

bun run db:migrate
bun run db:seed

if ! lsof -i :3001 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Starting gateway on port 3001..."
  bun run src/index.ts &
  echo $! > "$ROOT/.gateway.pid"
else
  echo "Gateway already listening on port 3001."
fi

cd "$ROOT/frontend"
if ! lsof -i :3000 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Starting frontend dev server on port 3000..."
  npm run dev &
  echo $! > "$ROOT/.frontend.pid"
else
  echo "Frontend already listening on port 3000."
fi

cd "$ROOT"

echo "AI Platform started."
echo "Gateway:   http://localhost:3001"
echo "Frontend:  http://localhost:3000"
echo "Keycloak:  http://localhost:8080"
echo "TaskView:  http://localhost:5174 (API :1401)"
echo "Superset:  http://127.0.0.1:9060 (API :9068)"
echo "(DataEase skipped)"
