"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  Package,
  Copy,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";
import { conversationApi } from "@/services/conversation.service";
import StatusBadge from "@/components/wholesale/StatusBadge";
import type {
  ConversationDetail,
  ConversationMessage,
  NegotiationOffer,
  RfqStatus,
} from "@/types/wholesale";
// FIX: this page was importing the old, standalone OfferCard and hand-rolling
// its own EventCard/MessageBubble/classifySystemMessage instead of the real
// card library that already exists at components/wholesale/conversation/
// (ConversationEventCard + CounterOfferCard/OfferAcceptedCard/
// OfferRejectedCard/SupplierConfirmedCard/etc, wired to the actual
// ConversationMessage.type values via EVENT_CARD_TYPES). That's why none of
// those cards were ever showing up here, no matter what the backend sent.
import { ConversationEventCard, type TimelineEvent } from "@/components/wholesale/conversation";
import ConversationSidebar from "@/components/wholesale/ConversationSidebar";
import { useConversation } from "@/providers/ConversationProvider";

function ConversationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 animate-pulse rounded bg-slate-200 w-3/4" />
      <div className="h-4 animate-pulse rounded bg-slate-200 w-1/2" />
      <div className="space-y-4 pt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

// ─── Messenger-style date separators ────────────────────────────────────────
// Kept here rather than in the card library, since ConversationEventCard's
// job is dispatching a single event to a single card — it doesn't know about
// neighboring events, which is exactly what a separator needs to decide.
const SEPARATOR_GAP_MS = 15 * 60 * 1000;

function startOfDayMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// `new Date(iso)` already parses both `...Z` and `...+08:00` ISO variants
// correctly and represents the instant in the browser's local timezone when
// read back via getFullYear/getHours/etc — no manual UTC offset math, which
// is exactly where "shifted by 8 hours" PH-timezone bugs usually come from.
function formatConversationDateSeparator(iso: string): string | null {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return null;
  const now = new Date();

  const time = date.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", hour12: true });
  const diffDays = Math.round((startOfDayMs(now) - startOfDayMs(date)) / 86400000);

  if (diffDays <= 0) return time; // today
  if (diffDays === 1) return `Yesterday ${time}`;
  if (diffDays < 7) {
    const weekday = date.toLocaleDateString("en-PH", { weekday: "long" });
    return `${weekday} ${time}`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    const monthDay = date.toLocaleDateString("en-PH", { month: "long", day: "numeric" });
    return `${monthDay}, ${time}`;
  }
  const monthDayYear = date.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
  return `${monthDayYear}, ${time}`;
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
    </div>
  );
}

// A single chronological row in the thread — a date separator, or a
// TimelineEvent to hand straight to ConversationEventCard. `messagePosition`
// is only meaningful when the event is a TEXT message.
type TimelineRow =
  | { kind: "separator"; key: string; timestamp: number; label: string }
  | { kind: "event"; key: string; timestamp: number; event: TimelineEvent; messagePosition: "single" | "first" | "middle" | "last" };

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({
    quantity: "",
    unitPrice: "",
    deliveryDate: "",
    notes: "",
  });
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);
  const { join, leave, events: wsEvents } = useConversation();

  const fetchConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationApi.getConversation(conversationId);
      setConversation(data);
      // Mark as read
      await conversationApi.markConversationRead(conversationId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  // Join the conversation room for real-time updates
  useEffect(() => {
    join(conversationId);
    return () => leave(conversationId);
  }, [conversationId, join, leave]);

  // Process real-time events from the WebSocket conversation context
  // — unchanged, no changes to WebSocket behavior here.
  useEffect(() => {
    const convEvents = wsEvents[conversationId] ?? [];
    if (convEvents.length === 0) return;

    setConversation((prev) => {
      if (!prev) return prev;
      let nextMessages = prev.messages ?? [];
      let nextOffers = prev.offers ?? [];

      for (const ev of convEvents) {
        const { event, payload } = ev;
        if (event === "conversation:newMessage") {
          const msg = payload;
          if (msg && msg.clientMessageId) {
            const existingIdx = nextMessages.findIndex((m) => m.clientMessageId === msg.clientMessageId);
            if (existingIdx >= 0) {
              nextMessages = [...nextMessages];
              nextMessages[existingIdx] = msg;
            } else if (!nextMessages.some((m) => m.id === msg.id)) {
              nextMessages = [...nextMessages, msg];
            }
          } else if (msg && !nextMessages.some((m) => m.id === msg.id)) {
            nextMessages = [...nextMessages, msg];
          }
        } else if (event === "offer:counter") {
          const offer = payload;
          if (offer && !nextOffers.some((o) => o.id === offer.id)) {
            nextOffers = [...nextOffers, offer];
          }
        } else if (event === "offer:accepted") {
          const { offerId } = payload;
          nextOffers = nextOffers.map((o) =>
            o.id === offerId ? { ...o, status: "ACCEPTED" } : o
          );
        } else if (event === "offer:rejected") {
          const { offerId } = payload;
          nextOffers = nextOffers.map((o) =>
            o.id === offerId ? { ...o, status: "REJECTED" } : o
          );
        }
      }

      if (
        nextMessages.length === prev.messages?.length &&
        nextOffers.length === prev.offers?.length
      ) {
        return prev;
      }

      return {
        ...prev,
        messages: nextMessages,
        offers: nextOffers,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [wsEvents, conversationId]);

  // Only the single most recent offer overall can still be acted on. Once you
  // counter (or the supplier replies), earlier offer cards lose their buttons.
  const latestOffer = useMemo(() => {
    if (!conversation?.offers?.length) return undefined;
    return [...conversation.offers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  }, [conversation?.offers]);

  // Build the unified timeline: messages + offers, sorted chronologically,
  // each message wrapped as a TimelineEvent for ConversationEventCard to
  // dispatch to the right card — plus interleaved date separators and, for
  // consecutive same-sender TEXT messages, a grouping position so the name/
  // avatar only render once per run instead of on every bubble.
  const rows: TimelineRow[] = useMemo(() => {
    if (!conversation) return [];

    type Raw = { timestamp: number; event: TimelineEvent };
    const raw: Raw[] = [];

    for (const m of conversation.messages || []) {
      // A COUNTER_OFFER-typed message would duplicate the matching
      // NegotiationOffer record's own card — this backend doesn't currently
      // create such messages (sendOffer only creates the offer record), but
      // this guard stays as a defensive no-op in case that ever changes.
      if (m.type === "COUNTER_OFFER" && !m.metadata) continue;
      raw.push({ timestamp: new Date(m.createdAt).getTime(), event: { kind: "message", data: m } });
    }
    for (const o of conversation.offers || []) {
      raw.push({ timestamp: new Date(o.createdAt).getTime(), event: { kind: "offer", data: o } });
    }
    raw.sort((a, b) => a.timestamp - b.timestamp);

    // First pass: build rows (with separators interleaved) and tag each
    // TEXT-message row with its sender key. A separator or any non-TEXT
    // event breaks a grouping run, same as it does in the Portal version.
    type BuiltRow =
      | { kind: "separator"; key: string; timestamp: number; label: string }
      | { kind: "event"; key: string; timestamp: number; event: TimelineEvent; isTextMessage: boolean; senderKey: string | null };

    const built: BuiltRow[] = [];
    let lastSeparatorMs: number | null = null;

    for (const { timestamp, event } of raw) {
      if (!isNaN(timestamp)) {
        const dayChanged = lastSeparatorMs !== null && startOfDayMs(new Date(timestamp)) !== startOfDayMs(new Date(lastSeparatorMs));
        const gapExceeded = lastSeparatorMs === null || timestamp - lastSeparatorMs >= SEPARATOR_GAP_MS;
        if (gapExceeded || dayChanged) {
          const label = formatConversationDateSeparator(new Date(timestamp).toISOString());
          if (label) {
            built.push({ kind: "separator", key: `sep-${timestamp}`, timestamp, label });
            lastSeparatorMs = timestamp;
          }
        }
      }

      const isTextMessage = event.kind === "message" && (event.data.type === "TEXT" || !event.data.type);
      const senderKey = event.kind === "message" ? `${event.data.senderRole}-${event.data.senderId}` : null;
      const key =
        event.kind === "message"
          ? `msg-${event.data.id}-${event.data.createdAt}`
          : `offer-${event.data.id}-${event.data.createdAt}`;
      built.push({ kind: "event", key, timestamp, event, isTextMessage, senderKey });
    }

    // Second pass: for each TEXT-message row, look at its immediate
    // neighbors (which already account for separators and non-TEXT events,
    // since those simply won't match isTextMessage/senderKey) to decide
    // single/first/middle/last.
    const result: TimelineRow[] = built.map((row, i) => {
      if (row.kind === "separator") return row;
      if (!row.isTextMessage) {
        return { kind: "event", key: row.key, timestamp: row.timestamp, event: row.event, messagePosition: "single" };
      }
      const prev = built[i - 1];
      const next = built[i + 1];
      const prevSame = prev?.kind === "event" && prev.isTextMessage && prev.senderKey === row.senderKey;
      const nextSame = next?.kind === "event" && next.isTextMessage && next.senderKey === row.senderKey;
      const messagePosition = prevSame && nextSame ? "middle" : prevSame ? "last" : nextSame ? "first" : "single";
      return { kind: "event", key: row.key, timestamp: row.timestamp, event: row.event, messagePosition };
    });

    return result;
  }, [conversation]);

  // Auto-scroll to bottom — instant on mount, smooth for new messages
  useEffect(() => {
    if (!conversation) return;
    const behavior: ScrollBehavior = isFirstScroll.current ? "auto" : "smooth";
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
    isFirstScroll.current = false;
  }, [conversation, rows.length, wsEvents]);

  const handleSendReply = async () => {
    if (!reply.trim() || !conversation) return;

    setIsSending(true);
    try {
       const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
       const optimisticMsg: ConversationMessage = {
         id: clientMessageId,
         conversationId,
         senderId: "",
         senderName: "You",
         senderRole: "AGENT" as const,
         message: reply,
         type: "TEXT",
         attachments: [],
         createdAt: new Date().toISOString(),
         clientMessageId,
         metadata: null,
       };

       // Optimistic insertion — will be replaced by the WebSocket event
       // which carries the server-generated message with the same clientMessageId.
       setConversation((prev) =>
         prev
           ? {
             ...prev,
             messages: [...(prev.messages || []), optimisticMsg],
             updatedAt: new Date().toISOString(),
           }
           : prev,
       );

       setReply("");

       await conversationApi.sendMessage(conversationId, {
         message: reply,
         attachments: [],
         clientMessageId,
       });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to send message.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendOffer = async () => {
    if (!conversation) return;

    if (!offerForm.quantity || !offerForm.unitPrice) {
      alert("Please specify quantity and unit price.");
      return;
    }

    setIsSendingOffer(true);
    try {
      const offer = await conversationApi.sendOffer(conversationId, {
        quantity: parseFloat(offerForm.quantity),
        unitPrice: parseFloat(offerForm.unitPrice),
        deliveryDate: offerForm.deliveryDate || undefined,
        notes: offerForm.notes || undefined,
      });

       setConversation((prev) => {
         if (!prev) return prev;

         const previousLatestOffer = [...(prev.offers || [])].sort(
           (a, b) =>
             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
         )[0];
         const wasCounteringSupplier =
           previousLatestOffer?.senderType === "SUPPLIER" &&
           previousLatestOffer?.status === "PENDING";

         const nextStatus: RfqStatus = wasCounteringSupplier
           ? "BUYER_COUNTERED"
           : "NEGOTIATING";

         if (prev.offers?.some((o) => o.id === offer.id)) return prev;

         return {
          ...prev,
          offers: [...(prev.offers || []), offer],
          rfq: prev.rfq ? { ...prev.rfq, status: nextStatus } : prev.rfq,
          updatedAt: new Date().toISOString(),
        };
      });
      setShowOfferForm(false);
      setOfferForm({
        quantity: "",
        unitPrice: "",
        deliveryDate: "",
        notes: "",
      });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to send offer.",
      );
    } finally {
      setIsSendingOffer(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!conversation) return;

    if (!confirm("Accept this offer? This will finalize the negotiation.")) {
      return;
    }

    try {
      await conversationApi.acceptOffer(conversationId, { offerId });
      // The backend now creates the OFFER_ACCEPTED timeline message itself
      // (see conversation.service.ts) — refetch so it (and the offer's new
      // status) show up rather than trying to hand-reconstruct it here.
      await fetchConversation();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to accept offer.",
      );
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!conversation) return;

    const reason = prompt("Reason for rejection (optional):") ?? undefined;

    try {
      await conversationApi.rejectOffer(conversationId, { reason });
      // Same as accept — the backend now creates the OFFER_REJECTED timeline
      // message itself, so refetch instead of reconstructing state by hand.
      await fetchConversation();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to reject offer.",
      );
    }
  };

  const handleCounterOffer = (offer: NegotiationOffer) => {
    setOfferForm({
      quantity: String(offer.quantity),
      unitPrice: String(offer.unitPrice),
      deliveryDate: offer.deliveryDate
        ? new Date(offer.deliveryDate).toISOString().split("T")[0]
        : "",
      notes: "",
    });
    setShowOfferForm(true);
  };

  const handleCopyRfqNumber = () => {
    if (conversation?.rfq?.rfqNumber) {
      navigator.clipboard.writeText(conversation.rfq.rfqNumber);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 overflow-x-auto">
            <div className="container-shell py-8">
              <ConversationSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 overflow-x-auto">
            <div className="container-shell py-8">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchConversation}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 overflow-x-auto">
            <div className="container-shell py-8">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  Conversation not found
                </h2>
                <p className="mt-2 text-slate-500">
                  The conversation you're looking for doesn't exist or you
                  don't have access.
                </p>
                <Link
                  href="/wholesale/inbox"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <ArrowLeft className="size-4" />
                  Back to Inbox
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const buyerName = "You";
  const supplierName = conversation.supplier?.name || "Supplier";

  return (
    <AgentAuthProvider>
      <main className="flex h-screen flex-col overflow-hidden bg-[#f7f7f5]">
        <Header wholesale />

        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="container-shell flex h-full flex-col py-8">
              {/* Page header */}
              <div className="mb-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href="/wholesale/inbox"
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                    title="Back to Inbox"
                  >
                    <ArrowLeft className="size-4" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {supplierName}
                    </h1>
                    <p className="mt-1 text-slate-600">
                      {conversation.product?.name || "Loading product..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {conversation.rfq?.rfqNumber && (
                    <span className="text-sm font-mono text-slate-500">
                      RFQ #{conversation.rfq.rfqNumber}
                    </span>
                  )}
                  <StatusBadge
                    status={(conversation.rfq?.status as RfqStatus) || "SUBMITTED"}
                  />
                  {conversation.rfq?.rfqNumber && (
                    <button
                      onClick={handleCopyRfqNumber}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100"
                      title="Copy RFQ number"
                    >
                      <Copy className="size-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Main content - split layout on desktop, single column on mobile.
                This grid fills all remaining vertical space below the header. */}
              <div className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-3">
                {/* Left: Conversation */}
                <div className="flex min-h-0 flex-col lg:col-span-2">
                  <div className="flex h-full min-h-0 flex-col rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <h2 className="mb-4 shrink-0 text-lg font-semibold text-slate-900">
                      Conversation
                    </h2>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {rows.length > 0 ? (
                        rows.map((row) => {
                          if (row.kind === "separator") {
                            return <DateSeparator key={row.key} label={row.label} />;
                          }
                          const isLatestOffer =
                            row.event.kind === "offer" && row.event.data.id === latestOffer?.id;
                          return (
                            <ConversationEventCard
                              key={row.key}
                              event={row.event}
                              isLatestOffer={isLatestOffer}
                          //    messagePosition={row.messagePosition}
                              supplierName={supplierName}
                              buyerName={buyerName}
                              onAcceptOffer={handleAcceptOffer}
                              onCounterOffer={handleCounterOffer}
                              onRejectOffer={handleRejectOffer}
                            />
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-500">
                          No messages yet. Start the conversation by sending a
                          message or an offer.
                        </p>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <div className="mt-4 shrink-0 border-t border-slate-200 pt-4">
                      {/* Offer form (conditional) */}
                      {showOfferForm && (
                        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <h3 className="text-sm font-medium text-slate-700 mb-3">
                            Send Counter Offer
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">
                                Quantity *
                              </label>
                              <input
                                type="number"
                                value={offerForm.quantity}
                                onChange={(e) =>
                                  setOfferForm({
                                    ...offerForm,
                                    quantity: e.target.value,
                                  })
                                }
                                placeholder="e.g. 1000"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">
                                Unit Price (₱) *
                              </label>
                              <input
                                type="number"
                                value={offerForm.unitPrice}
                                onChange={(e) =>
                                  setOfferForm({
                                    ...offerForm,
                                    unitPrice: e.target.value,
                                  })
                                }
                                placeholder="e.g. 160"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">
                                Delivery Date
                              </label>
                              <input
                                type="date"
                                value={offerForm.deliveryDate}
                                onChange={(e) =>
                                  setOfferForm({
                                    ...offerForm,
                                    deliveryDate: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">
                                Notes
                              </label>
                              <input
                                type="text"
                                value={offerForm.notes}
                                onChange={(e) =>
                                  setOfferForm({
                                    ...offerForm,
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Optional notes..."
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={handleSendOffer}
                              disabled={isSendingOffer}
                              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isSendingOffer ? "Sending..." : "Send Offer"}
                            </button>
                            <button
                              onClick={() => setShowOfferForm(false)}
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Message composer */}
                      <div className="flex gap-3">
                        <textarea
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Type your message..."
                          rows={3}
                          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setShowOfferForm(true)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            title="Send Offer"
                          >
                            <Package className="size-4" />
                          </button>
                          <button
                            onClick={handleSendReply}
                            disabled={isSending || !reply.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Send className="size-4" />
                            {isSending ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Sidebar — scrolls independently of the conversation */}
                <div className="overflow-y-auto lg:mt-0 mt-6">
                  <ConversationSidebar conversation={conversation} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AgentAuthProvider>
  );
}