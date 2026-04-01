# API Reference

Base URL: `/api/v1`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Example login request:

```json
{
  "email": "demo@quantlab.dev",
  "password": "demo1234"
}
```

## Datasets
- `POST /datasets/upload`
- `GET /datasets`
- `GET /datasets/{id}`

Upload expects multipart form-data with:
- `file` (CSV with `date,open,high,low,close,volume`)
- `name`
- `symbol`
- `timeframe`

## Backtests
- `POST /backtests`
- `GET /backtests`
- `GET /backtests/{id}`

Example backtest request:

```json
{
  "dataset_id": 1,
  "strategy_name": "ma_crossover",
  "initial_capital": 10000,
  "transaction_cost_bps": 5,
  "slippage_bps": 1,
  "position_size": 1,
  "params": {
    "fast_period": 20,
    "slow_period": 50
  }
}
```

## ML
- `POST /ml/train`
- `POST /ml/predict`

Example ML train request:

```json
{
  "dataset_id": 1,
  "model_type": "random_forest",
  "test_size": 0.2
}
```

## Realtime
- `WS /ws/prices`

## Error response examples

Validation error (FastAPI 422):

```json
{
  "detail": [
    {
      "loc": ["body", "initial_capital"],
      "msg": "Input should be a valid number",
      "type": "float_parsing"
    }
  ]
}
```

Auth/business error:

```json
{
  "detail": "Invalid credentials"
}
```
