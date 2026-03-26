import pandas as pd

from app.backtesting.indicators.rsi import rsi
from app.backtesting.strategies.base import Strategy


class RSIMeanReversionStrategy(Strategy):
    name = "rsi_mean_reversion"

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        lower = float(self.params.get("lower", 30))
        upper = float(self.params.get("upper", 70))
        values = rsi(data["close"], int(self.params.get("period", 14)))
        long = (values < lower).astype(int)
        flat = (values > upper).astype(int)
        pos = long.copy()
        for i in range(1, len(pos)):
            if flat.iloc[i] == 1:
                pos.iloc[i] = 0
            elif long.iloc[i] == 0:
                pos.iloc[i] = pos.iloc[i - 1]
        return pos.fillna(0)
