# Backtesting Engine

The backtesting engine is strategy-driven and dataset-agnostic.

- Indicators: SMA, EMA, RSI
- Strategies: MA crossover, RSI mean reversion, buy and hold
- Metrics:
  - total return
  - annualized return (date-based CAGR)
  - Sharpe ratio
  - max drawdown
  - win rate
- Costs:
  - transaction cost (bps)
  - slippage (bps)

## Engine flow

1. Load OHLCV dataset sorted by date.
2. Build strategy signals (`1` long / `0` flat).
3. Shift signals by one bar to avoid same-bar lookahead.
4. Compute bar returns and apply position sizing.
5. Apply transaction cost + slippage on position change events.
6. Build equity curve and trade events.
7. Compute metrics from the resulting equity curve.
