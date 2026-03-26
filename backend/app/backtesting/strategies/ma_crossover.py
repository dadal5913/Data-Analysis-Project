import pandas as pd

from app.backtesting.indicators.moving_average import sma
from app.backtesting.strategies.base import Strategy


class MovingAverageCrossoverStrategy(Strategy):
    name = "ma_crossover"

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        fast = int(self.params.get("fast_period", 20))
        slow = int(self.params.get("slow_period", 50))
        fast_ma = sma(data["close"], fast)
        slow_ma = sma(data["close"], slow)
        return (fast_ma > slow_ma).astype(int).fillna(0)
