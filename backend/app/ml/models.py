from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression


def create_model(model_type: str):
    if model_type == "random_forest":
        return RandomForestClassifier(n_estimators=200, random_state=42)
    if model_type == "gradient_boosting":
        return GradientBoostingClassifier(random_state=42)
    return LogisticRegression(max_iter=1000)
