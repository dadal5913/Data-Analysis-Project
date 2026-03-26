COMPOSE_FILE=infra/docker-compose.yml

up:
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) up -d --build

down:
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) down

build:
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) build

migrate:
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) exec backend sh -lc "PYTHONPATH=/app alembic upgrade head"

seed:
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) exec backend python -m app.db.seed

test:
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) exec backend pytest -q
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) exec frontend npm run test

lint:
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) exec backend ruff check app tests
	docker compose --env-file infra/.env.example -f $(COMPOSE_FILE) exec frontend npm run lint
