# QuantLab Architecture

QuantLab uses a monorepo with isolated frontend/backend/infra/docs concerns.

- Frontend consumes REST + WebSocket APIs.
- Backend uses layered architecture: API -> Services -> Repositories -> Models.
- PostgreSQL stores users, datasets, and backtest outputs.
- Redis supports live feed fan-out and cache-ready architecture.
