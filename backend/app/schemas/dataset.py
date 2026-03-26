from datetime import date, datetime

from pydantic import BaseModel


class DatasetCreate(BaseModel):
    name: str
    symbol: str
    timeframe: str = "1d"


class DatasetResponse(BaseModel):
    id: int
    name: str
    symbol: str
    timeframe: str
    row_count: int
    start_date: date
    end_date: date
    created_at: datetime

    model_config = {"from_attributes": True}
