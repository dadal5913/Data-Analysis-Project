import pandas as pd
from sqlalchemy.orm import Session

from app.models.dataset import Dataset


class DatasetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Dataset:
        dataset = Dataset(**kwargs)
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def get_by_id(self, dataset_id: int) -> Dataset | None:
        return self.db.query(Dataset).filter(Dataset.id == dataset_id).first()

    def list_by_user(self, user_id: int) -> list[Dataset]:
        return self.db.query(Dataset).filter(Dataset.user_id == user_id).order_by(Dataset.created_at.desc()).all()

    @staticmethod
    def load_ohlcv(file_path: str) -> pd.DataFrame:
        return pd.read_csv(file_path, parse_dates=["date"]).sort_values("date").reset_index(drop=True)
