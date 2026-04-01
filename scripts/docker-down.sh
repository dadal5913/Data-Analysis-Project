#!/usr/bin/env bash
# QuantLab – stopp Docker-stacken (samme env-fil som docker-up.sh).
#
#   bash scripts/docker-down.sh
#   bash scripts/docker-down.sh --volumes   # fjern også named volumes (sletter Postgres-data)
#
# Krever: Docker Desktop med `docker compose` v2.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="infra/.env.example"
if [[ -f infra/.env ]]; then
  ENV_FILE="infra/.env"
fi

docker compose --env-file "$ENV_FILE" -f infra/docker-compose.yml down "$@"

echo "Stack stopped (env: $ENV_FILE)."
