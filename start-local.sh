#!/usr/bin/env bash
set -e

echo "Starting AI Platform locally (no Docker)..."

# Ensure MySQL and Redis are reachable
mysqladmin ping -h localhost -P 3306 --silent || {
  echo "MySQL is not reachable on localhost:3306. Please start MySQL first."
  exit 1
}
redis-cli ping > /dev/null 2>&1 || {
  echo "Redis is not reachable on localhost:6379. Please start Redis first."
  exit 1
}

# Ensure Keycloak is reachable
curl -s http://localhost:8080/realms/aiplatform/.well-known/openid-configuration > /dev/null || {
  echo "Keycloak is not reachable on localhost:8080. Please start Keycloak first."
  exit 1
}

# Ensure subsystems are reachable
for port in 4096 8100 4091; do
  if ! lsof -i :"$port" > /dev/null 2>&1; then
    echo "Port $port is not listening. Please start the corresponding subsystem first."
    exit 1
  fi
done

cd gateway
if [ ! -f config.yaml ]; then
  cp config.example.yaml config.yaml
  echo "Created gateway/config.yaml from example."
fi

bun run db:migrate
bun run db:seed

echo "Starting gateway on port 3001..."
bun run src/index.ts &
GATEWAY_PID=$!

cd ../frontend
echo "Starting frontend dev server on port 3000..."
npm run dev &
FRONTEND_PID=$!

cd ..
echo "$GATEWAY_PID" > .gateway.pid
echo "$FRONTEND_PID" > .frontend.pid

echo "AI Platform started."
echo "Gateway: http://localhost:3001"
echo "Frontend: http://localhost:3000"
