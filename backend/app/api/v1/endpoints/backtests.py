from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.repositories.backtest_repo import BacktestRepository
from app.schemas.backtest import BacktestRequest, BacktestResponse, BacktestResultDetail
from app.services.backtest_service import BacktestService

router = APIRouter(prefix="/backtests", tags=["backtests"])


@router.post("", response_model=BacktestResponse)
def run_backtest(payload: BacktestRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return BacktestService(db).run_backtest(current_user.id, payload)


@router.get("", response_model=list[BacktestResponse])
def list_backtests(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return BacktestRepository(db).list_by_user(current_user.id)


@router.get("/{result_id}", response_model=BacktestResultDetail)
def get_backtest(result_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    result = BacktestRepository(db).get_by_id(result_id)
    if not result or result.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Not found")
    return result
