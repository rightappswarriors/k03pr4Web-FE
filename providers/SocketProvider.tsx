"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Event = { event: string; payload: any };
type Value = {
  connected: boolean;
  send: (event: string, payload?: object) => void;
  subscribe: (listener: (event: Event) => void) => () => void;
};

const Context = createContext<Value | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const ws = useRef<WebSocket | null>(null);
  const listeners = useRef(new Set<(event: Event) => void>());
  const retry = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedConversations = useRef(new Set<string>());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("agent_access_token") || localStorage.getItem("access");
    const api =
      process.env.NEXT_PUBLIC_WS_URL ||
      (process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, "ws").replace(/\/api\/?$/, "") + "/realtime");
    if (!token || !api || api.startsWith("undefined")) return;

    const connect = () => {
      const url = `${api}${api.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        if (!active) return;
        setConnected(true);
        // Re-join all conversation rooms that were previously joined.
        joinedConversations.current.forEach((convId) => {
          ws.current?.send(JSON.stringify({ event: "conversation:join", conversationId: convId }));
        });
      };

      socket.onmessage = ({ data }) => {
        try {
          const event = JSON.parse(data) as Event;
          listeners.current.forEach((listener) => listener(event));
        } catch {}
      };

      socket.onclose = () => {
        if (!active) return;
        setConnected(false);
        joinedConversations.current.clear();
        retry.current = setTimeout(connect, 1000);
      };
    };

    connect();
    return () => {
      active = false;
      if (retry.current) clearTimeout(retry.current);
      ws.current?.close();
    };
  }, []);

  const send = useCallback((event: string, payload: object = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event, ...payload }));
    }
    // Track conversation room joins/leaves for reconnect recovery (FIX #4)
    if (event === "conversation:join" && payload && "conversationId" in payload) {
      joinedConversations.current.add(String((payload as any).conversationId));
    }
    if (event === "conversation:leave" && payload && "conversationId" in payload) {
      joinedConversations.current.delete(String((payload as any).conversationId));
    }
  }, []);

  const subscribe = useCallback(
    (listener: (event: Event) => void) => {
      listeners.current.add(listener);
      return () => listeners.current.delete(listener);
    },
    []
  );

  return <Context.Provider value={{ connected, send, subscribe }}>{children}</Context.Provider>;
}

export function useSocket() {
  const value = useContext(Context);
  if (!value) throw new Error("useSocket must be used within SocketProvider");
  return value;
}
