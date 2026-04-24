"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useWebsocket } from "@/hooks/use-websocket";
import { ErrorBanner } from "@/components/ui/error-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Tick = { symbol: string; price: number; timestamp: string };

type TickState = Tick & { lastPrice?: number };

export function Watchlist() {
  const [ticks, setTicks] = useState<Record<string, TickState>>({});
  const prevRef = useRef<Record<string, number>>({});

  const onMessage = useCallback((tick: Tick) => {
    setTicks((prev) => {
      const prior = prev[tick.symbol];
      const lastPrice = prior?.price ?? prevRef.current[tick.symbol];
      prevRef.current[tick.symbol] = tick.price;
      return {
        ...prev,
        [tick.symbol]: { ...tick, lastPrice }
      };
    });
  }, []);

  const { isConnected, error } = useWebsocket<Tick>(
    process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws/prices",
    onMessage
  );
  const values = Object.values(ticks);

  return (
    <div className="space-y-2">
      {!isConnected && values.length === 0 ? (
        <LoadingSpinner label="Connecting to price stream..." />
      ) : null}
      {error ? <ErrorBanner message={error} /> : null}
      <ul className="divide-y divide-border/60 rounded-lg border border-border bg-surface/60">
        {values.map((t) => {
          const prev = t.lastPrice;
          const direction: "up" | "down" | "flat" =
            prev == null
              ? "flat"
              : t.price > prev
              ? "up"
              : t.price < prev
              ? "down"
              : "flat";
          return (
            <li
              className="flex items-center justify-between px-4 py-2.5"
              key={t.symbol}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-elevated text-2xs font-semibold text-foreground-muted">
                  {t.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.symbol}</p>
                  <p className="text-2xs text-foreground-subtle">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-md px-2 py-1 font-mono text-sm tabular-nums transition-colors",
                  direction === "up" && "bg-success/10 text-success",
                  direction === "down" && "bg-destructive/10 text-destructive",
                  direction === "flat" && "text-muted-foreground"
                )}
              >
                {t.price.toFixed(2)}
              </span>
            </li>
          );
        })}
        {values.length === 0 && isConnected ? (
          <li className="px-4 py-6 text-center text-xs text-foreground-subtle">
            Waiting for the first tick...
          </li>
        ) : null}
      </ul>
    </div>
  );
}
