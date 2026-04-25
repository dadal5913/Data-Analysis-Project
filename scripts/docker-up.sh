#!/usr/bin/env bash
# QuantLab — build and start the Docker stack, run Alembic on Neon, seed the demo user.
#
# Run from anywhere:
#   bash scripts/docker-up.sh
# From repo root after chmod +x:
#   ./scripts/docker-up.sh
#
# Requires:
#   - Docker Desktop with `docker compose` v2
#   - A Neon project: set DATABASE_URL in infra/.env (preferred) or infra/.env.example

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="infra/.env.example"
if [[ -f infra/.env ]]; then
  ENV_FILE="infra/.env"
  echo "Using env file: infra/.env"
else
  echo "Using env file: infra/.env.example"
  echo "  -> Copy it to infra/.env and set DATABASE_URL to your Neon connection string."
fi

# Guard against the placeholder URL.
if grep -qE '^DATABASE_URL=.*USER:PASSWORD@HOST\.neon\.tech' "$ENV_FILE"; then
  echo
  echo "ERROR: DATABASE_URL in $ENV_FILE is still the Neon placeholder."
  echo "Open https://console.neon.tech, copy the pooled connection string, and paste it"
  echo "into $ENV_FILE as DATABASE_URL (remember the 'postgresql+psycopg2://' scheme and"
  echo "the '?sslmode=require' suffix)."
  exit 1
fi

COMPOSE=(docker compose --env-file "$ENV_FILE" -f infra/docker-compose.yml)

echo "==> Building and starting containers..."
"${COMPOSE[@]}" up -d --build

echo "==> Waiting for backend container to accept exec..."
for _ in {1..90}; do
  if "${COMPOSE[@]}" exec -T backend true 2>/dev/null; then
    break
  fi
  sleep 1
done

echo "==> Waiting for API /health (http://localhost:8000)..."
HAS_CURL=0
if command -v curl >/dev/null 2>&1; then
  HAS_CURL=1
fi
for _ in {1..45}; do
  if [[ "$HAS_CURL" -eq 1 ]] && curl -sf "http://localhost:8000/health" >/dev/null 2>&1; then
    echo "Backend health OK."
    break
  fi
  sleep 2
done

echo "==> Alembic upgrade head (applies migrations on Neon)..."
"${COMPOSE[@]}" exec -T backend sh -lc "PYTHONPATH=/app alembic upgrade head"

echo "==> Seeding demo user..."
"${COMPOSE[@]}" exec -T backend python -m app.db.seed

echo ""
echo "Done."
echo "  Frontend:  http://localhost:3000"
echo "  API docs:  http://localhost:8000/docs"
echo "  Demo:      demo@quantlab.dev / demo1234"
echo ""
echo "Stop:  docker compose --env-file $ENV_FILE -f infra/docker-compose.yml down"
