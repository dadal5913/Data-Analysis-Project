"use client";

import { useCallback, useState } from "react";

import { useWebsocket } from "@/hooks/use-websocket";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Tick = { symbol: string; price: number; timestamp: string };

export function Watchlist() {
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const onMessage = useCallback((tick: Tick) => {
    setTicks((prev) => ({ ...prev, [tick.symbol]: tick }));
  }, []);
  const { isConnected, error } = useWebsocket<Tick>(
    process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws/prices",
    onMessage
  );
  const values = Object.values(ticks);

  return (
    <div className="space-y-2">
      {!isConnected && values.length === 0 ? <LoadingSpinner label="Connecting to price stream..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      {values.map((t) => (
        <div className="flex justify-between rounded border border-border p-2" key={t.symbol}>
          <span>{t.symbol}</span>
          <span>{t.price.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
