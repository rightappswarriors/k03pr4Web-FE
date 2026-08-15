"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  getAgentAccessToken,
  isAgentTokenExpired,
} from "@/lib/agent-auth-storage";
import { refreshAccessToken } from "@/lib/agent-api-client";

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

    // ── Resolve a fresh, valid token on every (re)connect attempt ─────────
    // The previous version captured the token once in the effect closure.
    // Agent access tokens expire in 15 minutes.  After expiry, Kompra BE
    // rejects the WebSocket upgrade, the `onclose` handler fires, and the
    // reconnect loop retries with the same dead token forever.  That is
    // exactly what the network tab shows: many Pending connections that are
    // all immediately closed.
    //
    // Fix: call this helper before every connect() so we always use a
    // current token.  It reads from localStorage (which the HTTP auto-refresh
    // path keeps up-to-date) and silently refreshes via the existing
    // single-flight refreshAccessToken() if the stored token is expired.
    async function getFreshToken(): Promise<string | null> {
      const stored = getAgentAccessToken();
      if (!stored) return null;
      if (!isAgentTokenExpired(stored)) return stored;
      // Access token is expired — attempt a silent refresh using the same
      // mechanism useAgentAuth and agentFetch use.  Returns null if the
      // refresh token is also expired (user must log in again).
      return refreshAccessToken();
    }

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ?.replace(/^http/, "ws")
        .replace(/\/api\/?$/, "") + "/realtime");

    if (!wsUrl || wsUrl.startsWith("undefined")) return;

    const connect = async () => {
      if (!active) return;

      const token = await getFreshToken();
      if (!token) {
        // No valid token and refresh failed — do not attempt to connect.
        // The user will be redirected to /login by AgentAuthProvider /
        // useAgentAuth on the next render cycle.
        if (process.env.NODE_ENV === "development") {
          console.warn("[SocketProvider] No valid agent token — WebSocket connection skipped.");
        }
        return;
      }

      const url = `${wsUrl}${wsUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        if (!active) return;
        setConnected(true);
        if (process.env.NODE_ENV === "development") {
          console.log("[SocketProvider] WebSocket connected.");
        }
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
        // Wait 2 s before the next attempt so we don't hammer the server,
        // and so that a token-refresh (which takes ~200-500 ms) has time
        // to complete before the next connect() reads from localStorage.
        retry.current = setTimeout(() => void connect(), 2000);
      };

      socket.onerror = () => {
        // Errors are surfaced via onclose; log in dev only to avoid noise.
        if (process.env.NODE_ENV === "development") {
          console.warn("[SocketProvider] WebSocket error (will retry).");
        }
      };
    };

    void connect();

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
    // Track conversation room joins/leaves for reconnect recovery.
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
