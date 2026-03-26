from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.backtesting.engine import BacktestEngine, STRATEGIES
from app.repositories.backtest_repo import BacktestRepository
from app.repositories.dataset_repo import DatasetRepository
from app.schemas.backtest import BacktestRequest


class BacktestService:
    def __init__(self, db: Session):
        self.dataset_repo = DatasetRepository(db)
        self.backtest_repo = BacktestRepository(db)
        self.engine = BacktestEngine()

    def run_backtest(self, user_id: int, payload: BacktestRequest):
        if payload.strategy_name not in STRATEGIES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported strategy")
        dataset = self.dataset_repo.get_by_id(payload.dataset_id)
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        data = self.dataset_repo.load_ohlcv(dataset.file_path)
        result = self.engine.run(
            data=data,
            strategy_name=payload.strategy_name,
            params=payload.params,
            config={
                "initial_capital": payload.initial_capital,
                "transaction_cost_bps": payload.transaction_cost_bps,
                "slippage_bps": payload.slippage_bps,
                "position_size": payload.position_size,
            },
        )

        return self.backtest_repo.create(
            user_id=user_id,
            dataset_id=payload.dataset_id,
            strategy_name=payload.strategy_name,
            params=payload.params,
            metrics=result["metrics"],
            equity_curve=result["equity_curve"],
            trades=result["trades"],
        )
