import asyncio
import random
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket

from app.core.config import get_settings

router = APIRouter(prefix="/ws", tags=["ws"])
settings = get_settings()


@router.websocket("/prices")
async def stream_prices(websocket: WebSocket):
    await websocket.accept()
    symbols = [s.strip() for s in settings.ws_price_symbols.split(",")]
    prices = {s: 100.0 + random.random() * 20 for s in symbols}

    while True:
        for symbol in symbols:
            drift = random.uniform(-1.0, 1.0)
            prices[symbol] = max(1.0, prices[symbol] + drift)
            await websocket.send_json(
                {
                    "symbol": symbol,
                    "price": round(prices[symbol], 2),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )
        await asyncio.sleep(1)
