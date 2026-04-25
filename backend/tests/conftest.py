import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

_ROOT = Path(__file__).resolve().parent


def pytest_configure():
    """Use SQLite + local uploads for tests so CI does not need Postgres."""
    os.environ.setdefault("DATABASE_URL", f"sqlite:///{_ROOT / 'test_quantlab.db'}")
    os.environ.setdefault("UPLOAD_DIR", str(_ROOT / "test_uploads"))


@pytest.fixture(scope="session", autouse=True)
def _sqlite_schema():
    """Bootstrap tables for SQLite (production uses Alembic on Postgres)."""
    from app.models.backtest import BacktestResult
    from app.models.base import Base
    from app.models.dataset import Dataset
    from app.models.user import User

    _ = (User, Dataset, BacktestResult)
    from app.db.session import engine

    Base.metadata.create_all(bind=engine)
    yield


def test_client():
    from app.main import app

    return TestClient(app)
