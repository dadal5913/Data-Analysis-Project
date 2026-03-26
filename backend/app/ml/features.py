import pandas as pd

from app.backtesting.indicators.rsi import rsi


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["ret_1"] = out["close"].pct_change()
    out["ret_5"] = out["close"].pct_change(5)
    out["vol_5"] = out["ret_1"].rolling(5).std()
    out["ma_5"] = out["close"].rolling(5).mean()
    out["ma_20"] = out["close"].rolling(20).mean()
    out["ma_ratio"] = out["ma_5"] / out["ma_20"]
    out["rsi_14"] = rsi(out["close"], 14)
    out["target"] = (out["close"].shift(-1) > out["close"]).astype(int)
    return out.dropna().reset_index(drop=True)
