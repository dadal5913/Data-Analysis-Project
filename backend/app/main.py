import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db.session import engine
from app.models.backtest import BacktestResult
from app.models.base import Base
from app.models.dataset import Dataset
from app.models.user import User

_ = (User, Dataset, BacktestResult)
settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=settings.api_prefix)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


os.makedirs(settings.upload_dir, exist_ok=True)
Base.metadata.create_all(bind=engine)
app = create_app()
