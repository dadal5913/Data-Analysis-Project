#!/usr/bin/env bash
# QuantLab – bygg og start Docker-stacken, sikre DB-schema, migrering (valgfritt), seed.
#
# Kjør fra hvor som helst:
#   bash scripts/docker-up.sh
# Fra repo-root etter chmod +x:
#   ./scripts/docker-up.sh
#
# Krever: Docker Desktop med `docker compose` v2.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="infra/.env.example"
if [[ -f infra/.env ]]; then
  ENV_FILE="infra/.env"
  echo "Using env file: infra/.env"
else
  echo "Using env file: infra/.env.example (kopier til infra/.env for egne secrets)"
fi

COMPOSE=(docker compose --env-file "$ENV_FILE" -f infra/docker-compose.yml)

echo "==> Building and starting containers..."
"${COMPOSE[@]}" up -d --build

echo "==> Waiting for PostgreSQL (matches infra/.env.example defaults: user/db quantlab)..."
for _ in {1..60}; do
  if "${COMPOSE[@]}" exec -T postgres pg_isready -U quantlab -d quantlab 2>/dev/null; then
    echo "PostgreSQL is ready."
    break
  fi
  sleep 1
done

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

echo "==> Ensuring database tables (SQLAlchemy create_all, idempotent)..."
"${COMPOSE[@]}" exec -T backend python -c \
  "from app.models.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"

echo "==> Alembic upgrade head (OK å fatle tomme versions-mappe)..."
set +e
"${COMPOSE[@]}" exec -T backend sh -lc "PYTHONPATH=/app alembic upgrade head"
ALEMBIC_EXIT=$?
set -e
if [[ $ALEMBIC_EXIT -ne 0 ]]; then
  echo "Note: Alembic exit $ALEMBIC_EXIT — ofte forventet før første revision er lagt i backend/alembic/versions/."
fi

echo "==> Seeding demo user..."
"${COMPOSE[@]}" exec -T backend python -m app.db.seed

echo ""
echo "Ferdig."
echo "  Frontend:  http://localhost:3000"
echo "  API docs:  http://localhost:8000/docs"
echo "  Demo:      demo@quantlab.dev / demo1234"
echo ""
echo "Stopp:  docker compose --env-file $ENV_FILE -f infra/docker-compose.yml down"
