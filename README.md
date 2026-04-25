# QuantLab

QuantLab is a production-style full-stack trading and market analysis platform for portfolio demonstration.  
It combines a Python backtesting engine, FastAPI services, a Next.js + shadcn/ui analytics dashboard, Neon-managed PostgreSQL persistence, Redis-powered realtime feeds, and a classical ML prediction pipeline.

## Architecture

```mermaid
graph TB
  Frontend[NextjsDashboard] -->|RESTJWT| Backend[FastAPI]
  Frontend -->|WebSocket| WsEndpoint[PriceStream]
  Backend --> Services[ServiceLayer]
  Services --> Backtesting[BacktestingEngine]
  Services --> MlModule[MLPipeline]
  Services -->|TLS sslmode=require| Neon[(Neon Postgres)]
  WsEndpoint --> Redis[(Redis)]
```

## Monorepo

- `frontend/` Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui (Radix + `lucide-react`) + Plotly
- `backend/` FastAPI + SQLAlchemy + Alembic + Pandas/NumPy + scikit-learn
- `infra/` docker-compose, env templates, nginx
- `docs/` architecture, API, backtesting engine, ML module docs

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)
- A free [Neon](https://console.neon.tech) project — grab the **pooled** connection string and put it in `infra/.env` as `DATABASE_URL` (the script refuses the placeholder)
- Optional: GNU `make`, if you want to use the repo `Makefile` targets

All commands below assume the repository root as the working directory.

## Local setup (Docker Compose)

The compose file lives at `infra/docker-compose.yml` and runs two containerized services (`redis`, `backend`, `frontend`) that talk to Neon over the public internet. It loads variables from `infra/.env.example`; copy it to `infra/.env` and paste your real `DATABASE_URL` there before the first start.

### 0. Configure Neon

```bash
cp infra/.env.example infra/.env
# then open infra/.env and replace the DATABASE_URL placeholder with your Neon
# pooled connection string, e.g.
# DATABASE_URL=postgresql+psycopg2://user:pwd@ep-foo.neon.tech/neondb?sslmode=require
```

See `docs/docker-local-setup.md` for the detailed walkthrough (including auto-suspend behaviour and SSL notes).

### 1. Start the stack

**One-shot (bash):** from repo root, run all startup steps (compose up, wait for API, Alembic on Neon, seed):

```bash
bash scripts/docker-up.sh
```

On Linux/macOS you can `chmod +x scripts/docker-up.sh` and then `./scripts/docker-up.sh`.

Using Make:

```bash
make up
```

Or explicitly (PowerShell / bash):

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build
```

### 2. Database schema

Schema is managed with **Alembic**. `scripts/docker-up.sh` runs `alembic upgrade head` after the API is healthy. To apply migrations yourself:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml logs --tail=50 backend
```

```bash
make migrate
```

Or:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml exec backend sh -lc "PYTHONPATH=/app alembic upgrade head"
```

Set `CORS_ORIGINS` in `infra/.env` to match your frontend origin (e.g. `http://localhost:3000`). See [docs/docker-local-setup.md](docs/docker-local-setup.md).

### 3. Seed demo user

```bash
make seed
```

Or:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml exec backend python -m app.db.seed
```

### 4. Open the app

- Frontend: [http://localhost:3000](http://localhost:3000) (redirects to `/login`)
- API docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

**Demo login**

- Email: `demo@quantlab.dev`
- Password: `demo1234`

### 5. Stop the stack

**Bash helper (same `infra/.env` resolution as `docker-up.sh`):**

```bash
bash scripts/docker-down.sh
```

> Your database lives on Neon, so `down` never touches it. To reset data, create a new Neon branch or run `DROP/TRUNCATE` against your current branch.

Using Make:

```bash
make down
```

Or:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml down
```

### Rebuild after dependency changes

If you change `backend/requirements.txt` or frontend `package.json` (e.g. adding a new shadcn/ui primitive), rebuild images:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml build --no-cache backend frontend
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d
```

## Deployment

The intended workflow is **local**: Docker Compose (Redis + backend + frontend) and **Neon** for Postgres. See **[`docs/docker-local-setup.md`](docs/docker-local-setup.md)** for the full walkthrough. A short summary lives in **[`docs/deployment.md`](docs/deployment.md)**. CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (tests plus an optional `Dockerfile.prod` build check for the backend).

## Troubleshooting

| Symptom | Likely cause | What to try |
|--------|----------------|-------------|
| `ERROR: DATABASE_URL ... is still the Neon placeholder` | You did not replace the template URL | Open `infra/.env`, paste your real Neon pooled URL (with `?sslmode=require`), and re-run the start script. |
| `could not translate host name` / `SSL connection has been closed` | Missing `sslmode=require` or wrong scheme | Confirm the URL starts with `postgresql+psycopg2://` and ends with `?sslmode=require`. |
| `localhost:3000` is blank or refuses connection | Frontend container crashed | `docker compose ... logs frontend` — Next.js expects `frontend/next.config.mjs` (not `next.config.ts` in this Node image). |
| `ModuleNotFoundError: No module named 'app'` when running Alembic | Python path inside container | Use `make migrate` or prefix with `PYTHONPATH=/app` (already wired in the Makefile). |
| `relation "users" does not exist` when running seed | Migrations not applied on Neon | Run `make migrate` or `alembic upgrade head` in the backend container (see section 2). |
| First API request after idle is slow (~1–3s) | Neon compute auto-suspend | Expected on free tier; `pool_pre_ping` handles stale connections transparently. |
| `email-validator is not installed` | Missing optional Pydantic email dependency | Rebuild backend after pulling `email-validator` in `requirements.txt`. |
| bcrypt / passlib errors during seed | `bcrypt` too new for `passlib` | `backend/requirements.txt` pins `bcrypt==4.0.1`; rebuild the backend image. |

## Example API endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/datasets`
- `POST /api/v1/datasets/upload`
- `POST /api/v1/backtests`
- `GET /api/v1/backtests`
- `GET /api/v1/strategies`
- `POST /api/v1/ml/train`
- `WS /api/v1/ws/prices`

## Screenshots

- `docs/screenshots/dashboard-overview.png` (recommended capture: `/dashboard`)
- `docs/screenshots/backtest-detail.png` (recommended capture: `/dashboard/backtests/{id}`)
- `docs/screenshots/ml-results.png` (recommended capture: `/dashboard/ml`)

Current UI now includes:
- Auth flow (`/login`, `/register`)
- Dataset upload + listing
- Backtest run flow with detail charts (equity + drawdown) and trade table
- ML training view with confusion matrix + feature importance
- Live WebSocket watchlist on dashboard home
- Table polish: pagination, search/filter and sorting on key views
- Stronger client-side form validation and inline field errors
- Improved backend error parsing (FastAPI `detail` string/array handling)
- Built on [shadcn/ui](https://ui.shadcn.com/) primitives (Radix + Tailwind CSS variables) with `lucide-react` icons

## Engineering decisions

- Layered backend architecture keeps business logic out of route handlers.
- Strategy pattern makes backtesting engine extensible.
- Typed frontend API client keeps API contracts explicit.
- ML module is separated from API routes for maintainability and testability.

## Roadmap

- Real broker integration adapter
- Advanced portfolio optimization
- Multi-asset and intraday support
- Celery background jobs for long-running backtests
- Role-based auth and team workspaces

## Suggested GitHub issues

1. Add async task queue for heavy backtests and ML training
2. Add comprehensive Alembic migrations with seed revisions
3. Add websocket fallback and heartbeat handling
4. Add strategy parameter validation schemas and UI forms
5. Add benchmark data provider adapters (Polygon, Binance, AlphaVantage)
6. Add portfolio/account ledger and transaction journal
7. Add Playwright E2E for auth + backtest run flow
8. Add model registry and persisted ML model artifacts
9. Add observability stack (OpenTelemetry + Prometheus/Grafana)
10. Add Kubernetes or other remote deployment manifests (optional; local Docker is the default)