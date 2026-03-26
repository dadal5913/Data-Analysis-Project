from sklearn.model_selection import train_test_split

from app.ml.evaluation import evaluate
from app.ml.features import engineer_features
from app.ml.models import create_model


def train_direction_model(df, model_type: str = "random_forest", test_size: float = 0.2):
    feature_df = engineer_features(df)
    feature_cols = ["ret_1", "ret_5", "vol_5", "ma_ratio", "rsi_14", "volume"]
    x = feature_df[feature_cols]
    y = feature_df["target"]
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=test_size, random_state=42, shuffle=False)

    model = create_model(model_type)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)
    report = evaluate(y_test, preds)

    fi = None
    if hasattr(model, "feature_importances_"):
        fi = {col: float(v) for col, v in zip(feature_cols, model.feature_importances_)}

    return {
        "model": model,
        "feature_cols": feature_cols,
        "metrics": report["metrics"],
        "confusion_matrix": report["confusion_matrix"],
        "feature_importance": fi,
    }
