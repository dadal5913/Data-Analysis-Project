import os
from pathlib import Path

from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test_quantlab.db"
os.environ["UPLOAD_DIR"] = str(Path.cwd() / "test_uploads")

from app.main import app


def test_backtest_api_flow():
    client = TestClient(app)

    register = client.post("/api/v1/auth/register", json={"email": "qa@quantlab.dev", "password": "pass1234"})
    assert register.status_code in (200, 400)

    login = client.post("/api/v1/auth/login", json={"email": "qa@quantlab.dev", "password": "pass1234"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    csv_content = (
        "date,open,high,low,close,volume\n"
        "2024-01-01,100,101,99,100,1000000\n"
        "2024-01-02,100,102,99,101,1100000\n"
        "2024-01-03,101,103,100,102,1200000\n"
        "2024-01-04,102,104,101,103,1300000\n"
    )

    upload = client.post(
        "/api/v1/datasets/upload",
        headers=headers,
        files={"file": ("sample.csv", csv_content, "text/csv")},
        data={"name": "Test Dataset", "symbol": "TEST", "timeframe": "1d"},
    )
    assert upload.status_code == 200
    dataset_id = upload.json()["id"]

    run = client.post(
        "/api/v1/backtests",
        headers=headers,
        json={
            "dataset_id": dataset_id,
            "strategy_name": "buy_and_hold",
            "initial_capital": 10000,
            "transaction_cost_bps": 5,
            "slippage_bps": 1,
            "position_size": 1,
            "params": {},
        },
    )
    assert run.status_code == 200
    body = run.json()
    assert "metrics" in body
    assert "id" in body

    invalid = client.post(
        "/api/v1/backtests",
        headers=headers,
        json={
            "dataset_id": dataset_id,
            "strategy_name": "buy_and_hold",
            "initial_capital": "bad-value",
            "transaction_cost_bps": 5,
            "slippage_bps": 1,
            "position_size": 1,
            "params": {},
        },
    )
    assert invalid.status_code == 422
    detail = invalid.json().get("detail")
    assert isinstance(detail, list)
