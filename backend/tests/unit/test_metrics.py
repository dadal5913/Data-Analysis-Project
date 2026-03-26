import pandas as pd

from app.backtesting.metrics import calculate_metrics


def test_metrics_keys():
    equity = pd.Series([100, 102, 101, 105])
    metrics = calculate_metrics(equity, [])
    assert "total_return" in metrics
    assert "sharpe_ratio" in metrics
