from fastapi import APIRouter

from app.api.v1.endpoints import auth, backtests, datasets, ml, strategies, ws

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(datasets.router)
api_router.include_router(backtests.router)
api_router.include_router(strategies.router)
api_router.include_router(ml.router)
api_router.include_router(ws.router)
