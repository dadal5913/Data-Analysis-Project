import os
from uuid import uuid4

import pandas as pd
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.repositories.dataset_repo import DatasetRepository


class DatasetService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DatasetRepository(db)
        self.settings = get_settings()
        os.makedirs(self.settings.upload_dir, exist_ok=True)

    def ingest_csv(self, user_id: int, file: UploadFile, name: str, symbol: str, timeframe: str):
        file_id = f"{uuid4()}.csv"
        file_path = os.path.join(self.settings.upload_dir, file_id)
        content = file.file.read()
        with open(file_path, "wb") as out:
            out.write(content)

        df = pd.read_csv(file_path, parse_dates=["date"])
        required = {"date", "open", "high", "low", "close", "volume"}
        if not required.issubset(df.columns):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV missing OHLCV columns")
        df = df.sort_values("date")

        return self.repo.create(
            user_id=user_id,
            name=name,
            symbol=symbol,
            timeframe=timeframe,
            row_count=len(df),
            start_date=df["date"].min().date(),
            end_date=df["date"].max().date(),
            file_path=file_path,
        )

    def list_datasets(self, user_id: int):
        return self.repo.list_by_user(user_id)
