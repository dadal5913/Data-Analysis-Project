import pandas as pd

from app.backtesting.strategies.buy_and_hold import BuyAndHoldStrategy


def test_buy_and_hold_signals():
    df = pd.DataFrame({"close": [1, 2, 3]})
    sig = BuyAndHoldStrategy().generate_signals(df)
    assert list(sig.values) == [1, 1, 1]
