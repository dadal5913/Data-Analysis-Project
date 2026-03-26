import pandas as pd

from app.backtesting.strategies.base import Strategy


class BuyAndHoldStrategy(Strategy):
    name = "buy_and_hold"

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        signals = pd.Series(1, index=data.index, dtype=int)
        signals.iloc[0] = 1
        return signals
