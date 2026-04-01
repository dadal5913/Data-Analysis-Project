import numpy as np
import pandas as pd


def max_drawdown(equity: pd.Series) -> float:
    running_max = equity.cummax()
    drawdown = equity / running_max - 1.0
    return float(drawdown.min())


def sharpe_ratio(returns: pd.Series, periods: int = 252) -> float:
    std = returns.std()
    if std == 0 or np.isnan(std):
        return 0.0
    return float((returns.mean() / std) * np.sqrt(periods))


def annualized_return(total_return: float, dates: pd.Series | None) -> float:
    if dates is None or len(dates) < 2:
        return 0.0
    start = pd.to_datetime(dates.iloc[0])
    end = pd.to_datetime(dates.iloc[-1])
    years = max((end - start).days / 365.25, 1 / 365.25)
    return float((1 + total_return) ** (1 / years) - 1)


def calculate_metrics(equity_curve: pd.Series, trades: list[dict], dates: pd.Series | None = None) -> dict[str, float]:
    returns = equity_curve.pct_change().fillna(0.0)
    total_return = float(equity_curve.iloc[-1] / equity_curve.iloc[0] - 1.0)
    cagr = annualized_return(total_return, dates)
    win_rate = 0.0
    if trades:
        wins = sum(1 for t in trades if t.get("pnl", 0) > 0)
        win_rate = wins / len(trades)
    return {
        "total_return": total_return,
        "annualized_return": cagr,
        "sharpe_ratio": sharpe_ratio(returns),
        "max_drawdown": max_drawdown(equity_curve),
        "win_rate": float(win_rate),
    }
