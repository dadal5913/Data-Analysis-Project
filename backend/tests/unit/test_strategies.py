import pandas as pd

from app.backtesting.strategies.buy_and_hold import BuyAndHoldStrategy
from app.backtesting.strategies.ma_crossover import MovingAverageCrossoverStrategy


def test_buy_and_hold_signals():
    df = pd.DataFrame({"close": [1, 2, 3]})
    sig = BuyAndHoldStrategy().generate_signals(df)
    assert list(sig.values) == [1, 1, 1]


def test_ma_crossover_generates_long_after_cross():
    df = pd.DataFrame({"close": [10, 10, 10, 11, 12, 13, 14, 15]})
    sig = MovingAverageCrossoverStrategy({"fast_period": 2, "slow_period": 4}).generate_signals(df)
    assert int(sig.iloc[-1]) == 1
