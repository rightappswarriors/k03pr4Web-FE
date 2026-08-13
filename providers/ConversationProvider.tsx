"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSocket } from "./SocketProvider";

const Context = createContext<{
  events: Record<string, any[]>;
  join: (id: string) => void;
  leave: (id: string) => void;
  typing: (id: string, active: boolean) => void;
} | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const { send, subscribe } = useSocket();
  const [events, setEvents] = useState<Record<string, any[]>>({});

  // Single listener — registered once on mount, cleaned up on unmount.
  // The subscribe callback is stable (useCallback in SocketProvider) so this
  // effect runs exactly once across the component's lifetime.
  useEffect(() => {
    return subscribe(({ event, payload }) => {
      if (!(event.startsWith("conversation:") || event.startsWith("offer:") || event.startsWith("purchaseOrder:"))) return;
      const id = payload?.conversationId;
      if (!id) return;

      // Deduplicate by server-generated id (prevents double-delivery via Redis + local),
      // or by clientMessageId (prevents duplicate confirmations of optimistic updates).
      // For clientMessageId matches, REPLACE the existing event so the confirmed
      // server payload (with full canonical sender identity) supersedes any
      // partial/optimistic version that may have been stored first.
      const msgId = payload?.id || payload?.offerId;
      const clientMsgId = payload?.clientMessageId;

      setEvents((old) => {
        const arr = old[id] ?? [];
        // REPLACES existing event with same clientMessageId (e.g. optimistic → confirmed)
        if (clientMsgId && arr.some((e) => e.payload?.clientMessageId === clientMsgId)) {
          return { ...old, [id]: arr.map((e) => (e.payload?.clientMessageId === clientMsgId ? { event, payload } : e)) };
        }
        // Ignores events with same server-generated id (prevents double-delivery)
        if (msgId && arr.some((e) => (e.payload?.id || e.payload?.offerId) === msgId)) return old;
        if (process.env.NODE_ENV === "development") {
          console.log(`[ConversationProvider] Received ${event} conversation:${id} (total: ${arr.length + 1})`);
        }
        return { ...old, [id]: [...arr, { event, payload }] };
      });
    });
  }, [subscribe]);

  // Stable join/leave/typing — depend only on send (which is stable from SocketProvider).
  // This prevents the page-level useEffect from re-running on every provider re-render.
  const join = useCallback((conversationId: string) => send("conversation:join", { conversationId }), [send]);
  const leave = useCallback((conversationId: string) => send("conversation:leave", { conversationId }), [send]);
  const typing = useCallback(
    (conversationId: string, active: boolean) =>
      send(active ? "typing:start" : "typing:stop", { conversationId }),
    [send]
  );

  const value = useMemo(() => ({ events, join, leave, typing }), [events, join, leave, typing]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useConversation() {
  const value = useContext(Context);
  if (!value) throw new Error("useConversation must be used within ConversationProvider");
  return value;
}
