from fastapi import APIRouter

router = APIRouter(prefix="/strategies", tags=["strategies"])


@router.get("")
def list_strategies():
    return [
        {"name": "ma_crossover", "params": {"fast_period": 20, "slow_period": 50}},
        {"name": "rsi_mean_reversion", "params": {"period": 14, "lower": 30, "upper": 70}},
        {"name": "buy_and_hold", "params": {}},
    ]
