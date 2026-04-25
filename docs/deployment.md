# Deployment (local development)

This project is set up to run **entirely on your machine** with **Docker Compose**: Redis, the FastAPI backend, and the Next.js frontend, with **Neon** as the managed Postgres database (no local PostgreSQL container).

**Do this:**

1. Copy `infra/.env.example` to `infra/.env` and set `DATABASE_URL` to your **Neon** pooled connection string (`postgresql+psycopg2://...?sslmode=require`).
2. From the repo root, start the stack (see below).

Full walkthrough, troubleshooting, and day-to-day commands: **[`docs/docker-local-setup.md`](docker-local-setup.md)**.

**Quick start (bash):**

```bash
bash scripts/docker-up.sh
```

**Or with Compose:**

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build
```

Then open [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:8000/docs](http://localhost:8000/docs).

**Production-style backend image (optional, e.g. CI):**

`backend/Dockerfile.prod` builds a non-root `gunicorn` image. It does **not** run Alembic on startup; run migrations the same way as in [`docker-local-setup.md`](docker-local-setup.md) (`alembic upgrade head` in the dev container, or your own one-off before starting this image against Neon).
