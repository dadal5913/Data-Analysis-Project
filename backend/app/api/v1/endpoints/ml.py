from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.ml import MLPredictionResponse, MLTrainRequest, MLTrainResponse
from app.services.ml_service import MLService

router = APIRouter(prefix="/ml", tags=["ml"])


@router.post("/train", response_model=MLTrainResponse)
def train(payload: MLTrainRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return MLService(db).train(current_user.id, payload)


@router.post("/predict", response_model=MLPredictionResponse)
def predict(current_user=Depends(get_current_user)):
    _ = current_user
    return {"direction": 1, "probability_up": 0.57, "metadata": {"note": "TODO: persist model and infer latest row"}}
