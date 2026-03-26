"use client";

import { useEffect, useRef } from "react";

export function useWebsocket(url: string, onMessage: (data: unknown) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (e) => onMessage(JSON.parse(e.data));
    return () => ws.close();
  }, [url, onMessage]);
}
