import pandas as pd

from app.backtesting.metrics import calculate_metrics
from app.backtesting.strategies.buy_and_hold import BuyAndHoldStrategy
from app.backtesting.strategies.ma_crossover import MovingAverageCrossoverStrategy
from app.backtesting.strategies.rsi_mean_reversion import RSIMeanReversionStrategy

STRATEGIES = {
    "ma_crossover": MovingAverageCrossoverStrategy,
    "rsi_mean_reversion": RSIMeanReversionStrategy,
    "buy_and_hold": BuyAndHoldStrategy,
}


class BacktestEngine:
    def run(self, data: pd.DataFrame, strategy_name: str, params: dict, config: dict) -> dict:
        strategy_cls = STRATEGIES[strategy_name]
        signals = strategy_cls(params).generate_signals(data).shift(1).fillna(0)
        returns = data["close"].pct_change().fillna(0.0)
        gross_returns = returns * signals * config.get("position_size", 1.0)
        transaction_cost = config.get("transaction_cost_bps", 5.0) / 10000.0
        slippage_cost = config.get("slippage_bps", 0.0) / 10000.0
        trade_events = signals.diff().abs().fillna(0.0)
        net_returns = gross_returns - trade_events * (transaction_cost + slippage_cost)
        equity = (1 + net_returns).cumprod() * config.get("initial_capital", 10000.0)

        trades: list[dict] = []
        for i in range(1, len(signals)):
            if trade_events.iloc[i] > 0:
                trades.append(
                    {
                        "date": str(data.iloc[i]["date"]),
                        "price": float(data.iloc[i]["close"]),
                        "signal": int(signals.iloc[i]),
                        "pnl": float(net_returns.iloc[i]),
                    }
                )

        metrics = calculate_metrics(equity, trades, data["date"])
        curve = [
            {"date": str(row.date), "equity": float(val)}
            for row, val in zip(data.itertuples(index=False), equity)
        ]
        return {"metrics": metrics, "equity_curve": curve, "trades": trades}
