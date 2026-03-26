import pandas as pd

from app.backtesting.indicators.moving_average import sma
from app.backtesting.indicators.rsi import rsi


def test_sma():
    s = pd.Series([1, 2, 3, 4, 5])
    out = sma(s, 3)
    assert round(out.iloc[-1], 4) == 4.0


def test_rsi_range():
    s = pd.Series([1, 2, 3, 2, 3, 4, 5, 4, 3, 4, 5, 6, 7, 6, 7, 8])
    out = rsi(s, 14).dropna()
    assert (out >= 0).all() and (out <= 100).all()
