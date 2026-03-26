from typing import Any

from pydantic import BaseModel


class MLTrainRequest(BaseModel):
    dataset_id: int
    model_type: str = "random_forest"
    test_size: float = 0.2


class MLTrainResponse(BaseModel):
    metrics: dict[str, float]
    confusion_matrix: list[list[int]]
    feature_importance: dict[str, float] | None = None


class MLPredictionResponse(BaseModel):
    direction: int
    probability_up: float
    metadata: dict[str, Any]
