"use client";

import { useEffect, useRef, useState } from "react";

export function useWebsocket<T>(url: string, onMessage: (data: T) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let shouldReconnect = true;

    const connect = () => {
      ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };
      ws.onmessage = (e) => onMessage(JSON.parse(e.data) as T);
      ws.onerror = () => setError("WebSocket connection error");
      ws.onclose = () => {
        setIsConnected(false);
        if (shouldReconnect) {
          reconnectTimer = setTimeout(connect, 1500);
        }
      };
    };

    connect();
    return () => {
      shouldReconnect = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [url, onMessage]);

  return { isConnected, error };
}
