import shutil
from pathlib import Path

import pandas as pd

from app.backtesting.engine import BacktestEngine
from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.backtest import BacktestResult
from app.models.dataset import Dataset
from app.models.user import User


def seed():
    settings = get_settings()
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "demo@quantlab.dev").first()
        if not existing:
            existing = User(email="demo@quantlab.dev", hashed_password=hash_password("demo1234"))
            db.add(existing)
            db.commit()
            db.refresh(existing)

        uploads_dir = Path(settings.upload_dir)
        uploads_dir.mkdir(parents=True, exist_ok=True)
        source_sample = Path(__file__).resolve().parents[2] / "data" / "sample" / "sp500_sample.csv"
        target_sample = uploads_dir / "sp500_sample_seed.csv"
        shutil.copyfile(source_sample, target_sample)

        dataset = (
            db.query(Dataset)
            .filter(Dataset.user_id == existing.id, Dataset.name == "S&P 500 Demo")
            .first()
        )
        if not dataset:
            frame = pd.read_csv(target_sample, parse_dates=["date"]).sort_values("date")
            dataset = Dataset(
                user_id=existing.id,
                name="S&P 500 Demo",
                symbol="SPX",
                timeframe="1d",
                row_count=len(frame),
                start_date=frame["date"].min().date(),
                end_date=frame["date"].max().date(),
                file_path=str(target_sample),
            )
            db.add(dataset)
            db.commit()
            db.refresh(dataset)

        seeded_backtest = (
            db.query(BacktestResult)
            .filter(BacktestResult.user_id == existing.id, BacktestResult.dataset_id == dataset.id)
            .first()
        )
        if not seeded_backtest:
            data = pd.read_csv(dataset.file_path, parse_dates=["date"]).sort_values("date").reset_index(drop=True)
            run = BacktestEngine().run(
                data=data,
                strategy_name="buy_and_hold",
                params={},
                config={
                    "initial_capital": 10000.0,
                    "transaction_cost_bps": 5.0,
                    "slippage_bps": 1.0,
                    "position_size": 1.0,
                },
            )
            db.add(
                BacktestResult(
                    user_id=existing.id,
                    dataset_id=dataset.id,
                    strategy_name="buy_and_hold",
                    params={},
                    metrics=run["metrics"],
                    equity_curve=run["equity_curve"],
                    trades=run["trades"],
                )
            )
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
