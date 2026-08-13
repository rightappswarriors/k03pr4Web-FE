"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, RefreshCw, MessageSquare } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { conversationApi } from "@/services/conversation.service";
import { RFQ_STATUS_CONFIG } from "@/types/wholesale";
import type { ConversationListItem, RfqStatus } from "@/types/wholesale";
import { useAgentAuth } from "@/hooks/useAgentAuth";

const STATUS_FILTERS: { label: string; value: RfqStatus | null }[] = [
  { label: "All", value: null },
  { label: "Negotiating", value: "NEGOTIATING" },
  { label: "Negotiating", value: "NEGOTIATION_COMPLETED" },
  { label: "Offer Accepted", value: "NEGOTIATION_ACCEPTED" },
  { label: "Awaiting Confirmation", value: "WAITING_SUPPLIER_CONFIRMATION" },
  { label: "Submitted", value: "SUBMITTED" },
];

function ConversationListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-slate-200"
        />
      ))}
    </div>
  );
}

export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [filtered, setFiltered] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<RfqStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { isAuthenticated, isLoading: authLoading } = useAgentAuth();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationApi.listConversations();
      setConversations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch conversations after auth has been fully restored
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchConversations();
    }
  }, [authLoading, isAuthenticated, fetchConversations]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?role=agent");
    }
  }, [authLoading, isAuthenticated, router]);

  // Apply filters
  useEffect(() => {
    let result = conversations;

    if (activeFilter) {
      result = result.filter(
        (conv) => conv.rfqStatus === activeFilter,
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (conv) =>
          conv.rfqNumber?.toLowerCase().includes(term) ||
          conv.supplier?.name?.toLowerCase().includes(term) ||
          conv.product?.name?.toLowerCase().includes(term),
      );
    }

    setFiltered(result);
  }, [conversations, activeFilter, searchTerm]);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );

  // While auth is being restored, show skeleton (no API calls fired)
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 overflow-x-auto">
            <div className="container-shell py-8">
              <ConversationListSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Not authenticated — redirect handled by useEffect above
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header wholesale />

      <div className="flex">
        <DashboardSidebar />

        <div className="flex-1 overflow-x-auto">
          <div className="container-shell py-8">
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
                <p className="mt-1 text-slate-600">
                  Your RFQ conversations with suppliers
                </p>
              </div>
              <button
                onClick={fetchConversations}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>

            {/* Unread filter toggle */}
            {totalUnread > 0 && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <span className="font-medium">{totalUnread} unread message</span>
                {totalUnread !== 1 ? "s" : ""}
                <span className="mx-2">·</span>
                <span>
                  Showing all conversations. Use filters to narrow down.
                </span>
              </div>
            )}

            {/* Search + Filter */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by RFQ number, supplier, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={fetchConversations}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>

            {/* Status filter tabs */}
            <div className="mb-6 overflow-x-auto">
              <div className="inline-flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-slate-200">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      activeFilter === filter.value
                        ? "bg-[#2f8f83] text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading && <ConversationListSkeleton />}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm border border-slate-100">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-slate-900">
                  {searchTerm || activeFilter
                    ? "No conversations match your filters"
                    : "No conversations yet"}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {searchTerm || activeFilter
                    ? "Try adjusting your search or filter criteria."
                    : "Browse products and request quotations directly from supplier pages to start conversations."}
                </p>
                {!searchTerm && !activeFilter && (
                  <Link
                    href="/wholesale/products"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <MessageSquare className="size-4" />
                    Browse Products
                  </Link>
                )}
              </div>
            )}

            {/* Conversation list */}
            {!loading && !error && filtered.length > 0 && (
              <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-200">
                  {filtered.map((conv) => {
                    const statusConfig =
                      RFQ_STATUS_CONFIG[conv.rfqStatus as RfqStatus] ||
                      RFQ_STATUS_CONFIG.SUBMITTED;
                    const supplier = conv.supplier;
                    const product = conv.product;
                    const latestMsg = conv.latestMessage;

                    return (
                      <Link
                        key={conv.id}
                        href={`/wholesale/inbox/${conv.id}`}
                        className="block p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Supplier logo */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            {supplier?.profilePhoto ? (
                              <img
                                src={supplier.profilePhoto}
                                alt={supplier.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-slate-600">
                                {supplier?.name?.charAt(0) || "?"}
                              </span>
                            )}
                          </div>

                          {/* Message content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">
                                  {supplier?.name || "Unknown Supplier"}
                                </span>
                                {supplier?.verified && (
                                  <span className="text-xs text-emerald-700">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
                                >
                                  {statusConfig.label}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {new Date(conv.updatedAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs font-mono text-slate-500">
                                {conv.rfqNumber}
                              </span>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs text-slate-500">
                                {product?.name || "Product"}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center gap-2">
                              {latestMsg ? (
                                <>
                                  <span
                                    className={`text-sm text-slate-600 ${
                                      conv.unreadCount > 0
                                        ? "font-medium"
                                        : ""
                                    }`}
                                  >
                                    {latestMsg.senderRole === "AGENT"
                                      ? "You: "
                                      : ""}
                                    {latestMsg.message.length > 100
                                      ? latestMsg.message.slice(0, 100) + "..."
                                      : latestMsg.message}
                                  </span>
                                  {conv.unreadCount > 0 && (
                                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-medium text-white">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-slate-400 italic">
                                  No messages yet
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
