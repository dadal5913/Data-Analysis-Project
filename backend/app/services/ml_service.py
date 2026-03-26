from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ml.pipeline import train_direction_model
from app.repositories.dataset_repo import DatasetRepository
from app.schemas.ml import MLTrainRequest


class MLService:
    def __init__(self, db: Session):
        self.dataset_repo = DatasetRepository(db)

    def train(self, payload: MLTrainRequest):
        dataset = self.dataset_repo.get_by_id(payload.dataset_id)
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        df = self.dataset_repo.load_ohlcv(dataset.file_path)
        result = train_direction_model(df, model_type=payload.model_type, test_size=payload.test_size)
        return {
            "metrics": result["metrics"],
            "confusion_matrix": result["confusion_matrix"],
            "feature_importance": result["feature_importance"],
        }
