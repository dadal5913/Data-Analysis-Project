from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.dataset import DatasetResponse
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.post("/upload", response_model=DatasetResponse)
def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    symbol: str = Form(...),
    timeframe: str = Form("1d"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return DatasetService(db).ingest_csv(current_user.id, file, name, symbol, timeframe)


@router.get("", response_model=list[DatasetResponse])
def list_datasets(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DatasetService(db).list_datasets(current_user.id)


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ds = DatasetService(db).repo.get_by_id(dataset_id)
    if not ds or ds.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Not found")
    return ds
