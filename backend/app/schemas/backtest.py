from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class BacktestRequest(BaseModel):
    dataset_id: int
    strategy_name: str
    initial_capital: float = 10000.0
    transaction_cost_bps: float = 5.0
    slippage_bps: float = 0.0
    position_size: float = 1.0
    params: dict[str, Any] = Field(default_factory=dict)


class BacktestResponse(BaseModel):
    id: int
    dataset_id: int
    strategy_name: str
    metrics: dict[str, float]
    created_at: datetime

    model_config = {"from_attributes": True}


class BacktestResultDetail(BacktestResponse):
    equity_curve: list[dict[str, Any]]
    trades: list[dict[str, Any]]
    params: dict[str, Any]
