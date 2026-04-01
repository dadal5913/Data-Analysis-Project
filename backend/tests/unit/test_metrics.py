import pandas as pd

from app.backtesting.metrics import calculate_metrics


def test_metrics_keys():
    equity = pd.Series([100, 102, 101, 105])
    dates = pd.Series(pd.to_datetime(["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"]))
    metrics = calculate_metrics(equity, [], dates)
    assert "total_return" in metrics
    assert "sharpe_ratio" in metrics
    assert metrics["max_drawdown"] <= 0
    assert metrics["total_return"] > 0
