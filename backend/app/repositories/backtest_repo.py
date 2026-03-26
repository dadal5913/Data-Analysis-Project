from sqlalchemy.orm import Session

from app.models.backtest import BacktestResult


class BacktestRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> BacktestResult:
        result = BacktestResult(**kwargs)
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def list_by_user(self, user_id: int) -> list[BacktestResult]:
        return self.db.query(BacktestResult).filter(BacktestResult.user_id == user_id).order_by(BacktestResult.created_at.desc()).all()

    def get_by_id(self, result_id: int) -> BacktestResult | None:
        return self.db.query(BacktestResult).filter(BacktestResult.id == result_id).first()
