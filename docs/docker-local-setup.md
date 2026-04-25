# Running QuantLab Locally with Docker

This document explains, step by step, how to bring the **QuantLab** stack up on your own machine using Docker. It targets a Windows + Docker Desktop environment (PowerShell), but all commands also work unchanged on Linux and macOS unless otherwise noted.

The goal is that after following this document you can:

- Build and start all services (**Redis**, **FastAPI backend**, **Next.js frontend**) against a **Neon** managed Postgres.
- Reach the app at [http://localhost:3000](http://localhost:3000) and the API docs at [http://localhost:8000/docs](http://localhost:8000/docs).
- Log in with a seeded demo user.
- Stop, rebuild, and troubleshoot the stack with confidence.

---

## 1. What gets started

The local stack is defined in `infra/docker-compose.yml` and consists of three services:

| Service    | Image / Build context | Host port (default) | Purpose |
|------------|-----------------------|----------------------|---------|
| `redis`    | `redis:7-alpine`      | `6379`               | Pub/sub + cache used by the WebSocket price stream. |
| `backend`  | built from `backend/` | `8000`               | FastAPI app (`uvicorn app.main:app` with `--reload`). Talks to Neon over the public internet. |
| `frontend` | built from `frontend/`| `3000`               | Next.js 14 dev server (`next dev`) using the shadcn/ui component library. |

Postgres is **not** run locally. The backend connects to a [Neon](https://neon.tech) project via the `DATABASE_URL` env var — a pooled, SSL-only connection string that looks like:

```
postgresql+psycopg2://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
```

All other variables (`REDIS_*`, `BACKEND_PORT`, `FRONTEND_PORT`, `NEXT_PUBLIC_*`, etc.) are read from an env file. The defaults used throughout this doc come from `infra/.env.example`.

---

## 2. Prerequisites

1. **Docker Desktop** with Compose v2 (verify with `docker compose version`).
2. Recommended Docker Desktop resources: **≥ 4 CPUs**, **≥ 6 GB RAM**, and a generous disk image size. The backend image pulls heavy Python wheels (`pandas`, `numpy`, `scikit-learn`) and the frontend installs the Next.js + shadcn/ui dependency tree.
3. A **Neon project** — sign up at [console.neon.tech](https://console.neon.tech), create a project, and copy the **pooled** connection string from the dashboard (the one that ends in `?sslmode=require`).
4. **Git Bash or WSL** if you want to use the helper scripts in `scripts/` (`bash scripts/docker-up.sh`). Pure PowerShell works too — the equivalent `docker compose` commands are given in every section.
5. **Free TCP ports 3000, 8000, 6379** on `localhost`. If any of those are in use, either stop that process or override the mapping (see section 8.2). Port `5432` is no longer needed — Neon is accessed over HTTPS/TLS on port `5432` outbound only.

All commands below assume the **repository root** (the folder containing `infra/`, `backend/`, `frontend/`) as the working directory.

---

## 3. Environment configuration

### 3.1 Template env file

`infra/.env.example` ships with safe local defaults plus a placeholder for the Neon URL:

```env
# --- Neon (managed Postgres) ---
# Paste your pooled connection string from https://console.neon.tech here.
# Must use the `postgresql+psycopg2://` scheme and include `?sslmode=require`.
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require

# --- Redis (local container) ---
REDIS_HOST=redis
REDIS_PORT=6379

# --- Service ports exposed on the host ---
BACKEND_PORT=8000
FRONTEND_PORT=3000

# --- Auth / API / CORS ---
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256

# --- App paths / streaming ---
UPLOAD_DIR=/app/uploads
WS_PRICE_SYMBOLS=AAPL,MSFT,SPY,BTCUSD

# --- Frontend (consumed by Next.js at build/runtime) ---
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws/prices
```

### 3.2 Your own env file (required for Neon)

Copy the template and paste your real Neon URL into the copy — **never commit the result**:

```powershell
Copy-Item infra/.env.example infra/.env
notepad infra/.env
```

Set `DATABASE_URL` to your actual Neon pooled connection string. The helper scripts (`scripts/docker-up.sh`, `scripts/docker-down.sh`) automatically prefer `infra/.env` over `infra/.env.example`. When calling `docker compose` directly, pass whichever file you want with `--env-file`.

> The startup script refuses to run if `DATABASE_URL` is still the `USER:PASSWORD@HOST.neon.tech` placeholder. Replace it before the first `up`.

### 3.3 Why Neon?

- **No local Postgres container** — faster startup, smaller disk footprint, no `postgres_data` volume to manage.
- **Auto-suspend + scale-to-zero** on the Neon free tier. The backend engine (`backend/app/db/session.py`) is configured with `pool_pre_ping`, `pool_recycle=300s`, and TCP keepalives so idle connections survive the first request after a suspend window.
- **One source of truth** between local development, CI, and production — point each environment at its own Neon branch by swapping `DATABASE_URL`.

---

## 4. Starting the stack

There are three equivalent ways to start the stack. Pick one.

### 4.1 One-shot bash script (recommended)

From the repo root, in **Git Bash** or **WSL**:

```bash
bash scripts/docker-up.sh
```

What the script does, in order:

1. Selects `infra/.env` if present, otherwise `infra/.env.example`.
2. Refuses to continue if `DATABASE_URL` still contains the Neon placeholder.
3. `docker compose ... up -d --build` to build and start the three services.
4. Waits for the backend container to accept `exec` calls.
5. Polls `http://localhost:8000/health` until the API is reachable.
6. Runs `alembic upgrade head` inside the backend container to apply migrations on Neon (required before seed).
7. Seeds the demo user (`python -m app.db.seed`).
8. Prints the URLs and demo credentials.

### 4.2 Make targets

If `make` is installed:

```bash
make up        # build + start
make migrate   # alembic upgrade head (inside backend container)
make seed      # demo user seed
make down      # stop
```

### 4.3 Explicit `docker compose` commands

Plain PowerShell or any shell:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build
```

You can then perform the equivalent of the helper script manually:

```powershell
# 1) Tail backend logs and wait until "Uvicorn running on ..." appears
docker compose --env-file infra/.env -f infra/docker-compose.yml logs -f backend

# 2) Apply migrations (schema is managed by Alembic; use a fresh Neon branch or empty DB for first run)
docker compose --env-file infra/.env -f infra/docker-compose.yml `
  exec backend sh -lc "PYTHONPATH=/app alembic upgrade head"

# 3) Seed demo user
docker compose --env-file infra/.env -f infra/docker-compose.yml `
  exec backend python -m app.db.seed
```

> The first build is the slow one. Expect several minutes for the initial backend `pip install` and frontend `npm install` (Next.js + shadcn/ui + Radix primitives). Subsequent starts without `--build` are fast because Docker reuses cached layers. `frontend/.dockerignore` and `backend/.dockerignore` are in the repo to keep the build context small (`node_modules`, `.next`, `.venv`, and uploads are excluded).

---

## 5. Verifying the stack

After startup:

1. `docker compose ... ps` should show all three containers (`redis`, `backend`, `frontend`) as **running**.
2. Open the frontend: [http://localhost:3000](http://localhost:3000) — it redirects to `/login`. The UI uses the shadcn/ui component library (Radix primitives under the hood, `lucide-react` for icons).
3. Open the API docs: [http://localhost:8000/docs](http://localhost:8000/docs) — Swagger UI should list `auth`, `datasets`, `backtests`, `strategies`, `ml`, and `ws` endpoints.
4. Log in with the demo account:
   - **Email:** `demo@quantlab.dev`
   - **Password:** `demo1234`
5. Verify Neon connectivity in the Neon console — the **Monitoring** tab should show active connections from your backend container.

If any of those steps fail, jump to section 8.

---

## 6. Day-to-day workflow

### 6.1 Code changes

Both the backend and frontend containers use **bind mounts** back to your repo:

- `../backend:/app` on the backend — `uvicorn --reload` picks up Python changes automatically.
- `../frontend:/app` + anonymous `/app/node_modules` + anonymous `/app/.next` on the frontend — Next.js dev server hot-reloads on TS/TSX changes. The anonymous volumes keep the container-internal `node_modules` (with the Linux-native `rollup` binary) separate from your host's Windows `node_modules`.

So day-to-day you normally do **not** rebuild images. Just edit files and the containers pick them up.

### 6.2 Viewing logs

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml logs -f backend
docker compose --env-file infra/.env -f infra/docker-compose.yml logs -f frontend
```

### 6.3 Opening a shell inside a container

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml exec backend bash
docker compose --env-file infra/.env -f infra/docker-compose.yml exec frontend sh
```

### 6.4 Running tests and tools

```powershell
# Backend unit tests (pytest)
docker compose --env-file infra/.env -f infra/docker-compose.yml exec backend pytest

# Frontend unit tests (vitest + @testing-library/react)
docker compose --env-file infra/.env -f infra/docker-compose.yml exec frontend npm test
```

### 6.5 Adding new shadcn/ui components

The frontend is configured with `components.json` at `frontend/components.json`. New shadcn components go under `frontend/src/components/ui/`. To add one:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml exec frontend npx shadcn@latest add dialog
```

Or run `npx shadcn add ...` on the host against the `frontend/` directory. The installed primitives re-use the existing design tokens defined in `frontend/src/app/globals.css` (HSL CSS variables) and `frontend/tailwind.config.ts`.

### 6.6 Rebuilding after dependency changes

You only need to rebuild images when you change dependency files:

- `backend/requirements.txt`
- `frontend/package.json` / `frontend/package-lock.json`
- Either `Dockerfile`

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml build --no-cache backend frontend
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d
```

---

## 7. Stopping the stack

### 7.1 Keep data

```bash
bash scripts/docker-down.sh
# or
docker compose --env-file infra/.env -f infra/docker-compose.yml down
```

This stops and removes containers. Your Neon database is untouched — it lives on Neon's servers, not in a local volume.

### 7.2 Also reset Redis state

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml down -v
```

The `-v` flag removes the anonymous Redis volume (if any). Neon data is still only manageable through the Neon console or SQL — there is nothing local to purge.

### 7.3 Wiping Neon data

If you want a clean database, either:

- Create a new **Neon branch** from the dashboard and point `DATABASE_URL` at it, **or**
- Connect to Neon with `psql` and run `DROP TABLE ...` / `TRUNCATE ...` manually.

Then re-run the migration + seed steps from section 4 (`alembic upgrade head`, then `python -m app.db.seed`).

---

## 8. Troubleshooting

### 8.1 `DATABASE_URL` placeholder error

Symptom:

```
ERROR: DATABASE_URL in infra/.env is still the Neon placeholder.
```

`scripts/docker-up.sh` detected the `USER:PASSWORD@HOST.neon.tech` placeholder. Open `infra/.env`, paste your real Neon pooled connection string (keep the `postgresql+psycopg2://` scheme and the `?sslmode=require` query param), save, and re-run.

### 8.2 Backend cannot reach Neon

Symptoms in `docker compose logs backend`:

```
psycopg2.OperationalError: could not translate host name "..." to address
sqlalchemy.exc.OperationalError: SSL connection has been closed unexpectedly
```

Checklist:

1. The connection string uses `postgresql+psycopg2://` (not `postgres://`).
2. The query string includes `sslmode=require`. Neon rejects non-SSL connections.
3. The host inside the URL ends with `.neon.tech`.
4. Your Neon project is **not suspended beyond the free-tier limits** (idle auto-suspend is fine — the first request will wake it up; check the Neon dashboard if the compute is stopped).
5. Your machine has outbound TCP access to port `5432` (corporate firewalls sometimes block Postgres ports).

### 8.3 Frontend build hangs on `npm install`

Symptoms in the build log:

```
=> [frontend 4/5] RUN npm install    2616.2s
```

The first `npm install` in Docker on Windows should normally take **a few minutes**, not tens of minutes. When it blows up to 30+ minutes the cause is almost always environmental:

- **OneDrive-synced project folder** or **Windows Defender real-time scanning** hammering the virtual disk. Add an exclusion for Docker Desktop's data folder and for the project directory, or move the repo outside OneDrive.
- **Low Docker Desktop resources.** Increase CPU / memory / swap in Docker Desktop settings.
- **Build context too large.** If the first build log shows a line like `transferring context: 556.60MB` for the frontend, something heavy (usually `node_modules`, `.next`, or the uploads folder) is being shipped to the Docker daemon. Confirm `frontend/.dockerignore` and `backend/.dockerignore` are committed so those are excluded.
- **Network / proxy issues** against the npm registry.

Once the layer is built, later rebuilds reuse the cache as long as `package.json` / `package-lock.json` do not change.

### 8.4 "ports are not available" — port 3000 / 8000 already in use

Symptom:

```
Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:3000 ...
bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.
```

This means another process on your host is already listening on that port. You have two options.

**Option A — free the port on Windows (PowerShell):**

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Repeat for `8000` if needed, then `docker compose ... up -d` again.

**Option B — remap the port.** Edit `infra/.env` and change the host-side port:

```env
FRONTEND_PORT=3100
BACKEND_PORT=8001
```

Then restart the stack. You also need to update `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_WS_URL` accordingly, since the browser talks to the backend via the **host** port, not the container port.

### 8.5 `ModuleNotFoundError: No module named 'app'` during Alembic

Alembic is being run without the correct `PYTHONPATH`. Either use `make migrate`, or run:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml `
  exec backend sh -lc "PYTHONPATH=/app alembic upgrade head"
```

### 8.6 `relation "users" does not exist` during seed

Migrations were not applied on Neon. Run `alembic upgrade head` from section 4.3 step 2 (or `make migrate`), then seed again.

### 8.7 Frontend loads but API calls fail with CORS / network errors

Check that `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_WS_URL` in the env file match the **host** ports you mapped. The Next.js app runs in your browser, so it reaches the backend via `localhost:<BACKEND_PORT>`, not via the Docker service name `backend`.

Also ensure `CORS_ORIGINS` includes your frontend origin exactly (scheme + host + port), e.g. `http://localhost:3000`. The API no longer uses `Access-Control-Allow-Origin: *` with credentials.

### 8.8 Neon auto-suspend tail-latency on the first request

The free-tier Neon compute auto-suspends after several minutes of idleness. The first request after a suspend can take 1–3 seconds to cold-start. This is not an error; subsequent requests are fast. The backend's SQLAlchemy engine is configured with `pool_pre_ping=True` and TCP keepalives so the pool transparently drops stale connections during the suspend/resume dance.

### 8.9 Resetting everything

If the stack gets into a weird state, a clean reset usually fixes it:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml down -v
docker compose --env-file infra/.env -f infra/docker-compose.yml build --no-cache
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d
```

Then re-run `alembic upgrade head` and the seed step. If you also want to wipe Neon data, see section 7.3.

---

## 9. What's happening under the hood

A quick mental model of the local setup:

```
Browser  ──HTTP──▶  http://localhost:3000    ──▶  frontend (Next.js dev, shadcn/ui)
Browser  ──HTTP──▶  http://localhost:8000    ──▶  backend  (FastAPI + uvicorn --reload)
Browser  ──WS────▶  ws://localhost:8000/...  ──▶  backend ──▶ redis

backend  ──TLS──▶  *.neon.tech:5432  (Postgres over the public internet, sslmode=require)
backend  ──TCP──▶  redis:6379        (inside the compose network)
```

- The **host** only exposes three ports (`3000`, `8000`, `6379`).
- **Service-to-service** traffic inside the compose network uses Docker service names (`redis`, `backend`, `frontend`).
- **Database traffic** leaves the machine — the backend talks directly to Neon over TLS. There is no local Postgres container or volume.
- **Source code** is mounted live into the backend and frontend containers, so most changes do not require a rebuild — only dependency changes do.
- **Frontend UI** is built on shadcn/ui components (Radix primitives + Tailwind CSS variables) with `lucide-react` icons, re-exported through `frontend/src/components/ui/icons.tsx` so legacy `IconX` imports keep working.

---

## 10. Quick reference

```powershell
# Start (with build)
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build

# Start (no rebuild)
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d

# Logs
docker compose --env-file infra/.env -f infra/docker-compose.yml logs -f backend

# Shell into backend
docker compose --env-file infra/.env -f infra/docker-compose.yml exec backend bash

# Run tests
docker compose --env-file infra/.env -f infra/docker-compose.yml exec backend pytest
docker compose --env-file infra/.env -f infra/docker-compose.yml exec frontend npm test

# Seed demo user
docker compose --env-file infra/.env -f infra/docker-compose.yml exec backend python -m app.db.seed

# Stop (keep containers removed, Neon data intact)
docker compose --env-file infra/.env -f infra/docker-compose.yml down
```

Demo credentials: **`demo@quantlab.dev` / `demo1234`**.
