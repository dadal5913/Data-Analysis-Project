"use client";

import { useEffect, useState } from "react";

type Tick = { symbol: string; price: number; timestamp: string };

export function Watchlist() {
  const [ticks, setTicks] = useState<Record<string, Tick>>({});

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws/prices");
    ws.onmessage = (e) => {
      const tick = JSON.parse(e.data) as Tick;
      setTicks((prev) => ({ ...prev, [tick.symbol]: tick }));
    };
    return () => ws.close();
  }, []);

  return (
    <div className="space-y-2">
      {Object.values(ticks).map((t) => (
        <div className="flex justify-between rounded border border-border p-2" key={t.symbol}>
          <span>{t.symbol}</span>
          <span>{t.price.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
