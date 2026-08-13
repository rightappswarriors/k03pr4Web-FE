"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  FileText,
  Calendar,
  Package,
  User,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Copy,
  Trash2,
  Send as SendIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";
import { rfqApi } from "@/services/rfq.service";
import { RFQ_STATUS_CONFIG } from "@/types/wholesale";
import type { RequestForQuotation, RfqStatus, RfqConversationMessage } from "@/types/wholesale";
import StatusBadge from "@/components/wholesale/StatusBadge";
function RfqDetailSkeleton() {
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

function StatusTimeline({ status }: { status: RfqStatus }) {
  const allStatuses = [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "RESPONDED",
    "NEGOTIATING",
    "NEGOTIATION_ACCEPTED",
    "ACCEPTED",
  ];

  // Determine which statuses have been reached
  const statusOrder = allStatuses.indexOf(status);

  const steps = [
    { key: "DRAFT", label: "Draft", desc: "RFQ saved as draft" },
    { key: "SUBMITTED", label: "Submitted", desc: "RFQ sent to supplier" },
    { key: "UNDER_REVIEW", label: "Under Review", desc: "Supplier reviewing" },
    { key: "RESPONDED", label: "Supplier Responded", desc: "Quotation received" },
    { key: "NEGOTIATING", label: "Negotiating", desc: "Counter-offers in progress" },
    { key: "NEGOTIATION_ACCEPTED", label: "Offer Accepted", desc: "Offer accepted, awaiting finalization" },
    { key: "ACCEPTED", label: "Accepted", desc: "Quotation accepted" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-700">RFQ Progress</h3>
      <div className="relative">
        {steps.map((step, index) => {
          const isComplete = index <= statusOrder;
          const isCurrent = index === statusOrder;
          return (
            <div key={step.key} className="relative pb-4 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  className={`absolute left-4 top-8 h-full w-0.5 ${isComplete ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${isComplete
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-slate-400"
                    }`}
                >
                  {isComplete ? (
                    <CheckCircle className="size-4" />
                  ) : (
                    <Clock className="size-4" />
                  )}
                </span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${isComplete ? "text-slate-900" : "text-slate-500"
                      }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </div>
                {isCurrent && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: RfqConversationMessage }) {
  const isAgent = message.senderRole === "AGENT";

  return (
    <div className={`flex gap-3 ${isAgent ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-xl px-4 py-3 ${isAgent
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-slate-900"
          }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <User className="size-3" />
          <span className="text-xs font-medium">
            {isAgent ? message.senderName : `${message.senderName} (Supplier)`}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <FileText className="size-3" />
                <span>{att.replace("upload://", "")}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-1 text-right">
          <span className="text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RfqDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<RequestForQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRfq = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rfqApi.getRfq(rfqId);
      setRfq(data);
      // If the RFQ has a conversation, redirect to the inbox conversation page
      if (data.conversationId) {
        router.replace(`/wholesale/inbox/${data.conversationId}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load RFQ. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [rfqId, router]);

  useEffect(() => {
    fetchRfq();
  }, [fetchRfq]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rfq?.messages]);

  const handleCopyRfqNumber = () => {
    if (rfq?.rfqNumber) {
      navigator.clipboard.writeText(rfq.rfqNumber);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !rfq) return;

    setIsSending(true);
    try {
      // In a full implementation, this would POST to the conversation messages endpoint
      // For now, we update the local state optimistically
      const newMessage: RfqConversationMessage = {
        id: `msg_${Date.now()}`,
        senderId: rfq.agentId,
        senderName: rfq.agentName,
        senderRole: "AGENT",
        message: reply,
        attachments: [],
        createdAt: new Date().toISOString(),
      };

      setRfq((prev) =>
        prev
          ? {
            ...prev,
            messages: [...(prev.messages || []), newMessage],
          }
          : prev,
      );
      setReply("");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to send message.",
      );
    } finally {
      setIsSending(false);
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
              <RfqDetailSkeleton />
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
                  onClick={fetchRfq}
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

  if (!rfq) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 overflow-x-auto">
            <div className="container-shell py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-300" />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  RFQ not found
                </h2>
                <p className="mt-2 text-slate-500">
                  The RFQ you're looking for doesn't exist or has been deleted.
                </p>
                <Link
                  href="/wholesale/rfqs"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <ArrowLeft className="size-4" />
                  Back to RFQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const statusConfig = RFQ_STATUS_CONFIG[rfq.status];

  return (
    <AgentAuthProvider>
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />

        <div className="flex">
          <DashboardSidebar />

          <div className="flex-1 overflow-x-auto">
            <div className="container-shell py-8">
              {/* Page header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href="/wholesale/rfqs"
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                    title="Back to RFQs"
                  >
                    <ArrowLeft className="size-4" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      RFQ #{rfq.rfqNumber}
                    </h1>
                    <p className="mt-1 text-slate-600">
                      Conversation with {rfq.supplier?.name || "supplier"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                  <button
                    onClick={handleCopyRfqNumber}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    title="Copy RFQ number"
                  >
                    <Copy className="size-3" />
                  </button>
                  {rfq.status !== "NEGOTIATION_ACCEPTED" &&
                    rfq.status !== "NEGOTIATION_REJECTED" &&
                    rfq.status !== "PO_CREATED" &&
                    rfq.status !== "CANCELLED" &&
                    rfq.status !== "EXPIRED" && (
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              `Delete RFQ #${rfq.rfqNumber}? This action cannot be undone.`,
                            )
                          ) {
                            try {
                              await rfqApi.deleteRfq(rfq.id);
                              router.push("/wholesale/rfqs");
                            } catch (err) {
                              alert(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to delete RFQ.",
                              );
                            }
                          }
                        }}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title="Delete RFQ"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                </div>
              </div>

              {/* Main content grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column: RFQ details + conversation */}
                <div className="lg:col-span-2">
                  {/* Supplier Info */}
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Supplier
                    </h2>
                    {rfq.supplier ? (
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                          <User className="size-6 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {rfq.supplier.name}
                          </p>
                          {rfq.supplier.location && (
                            <p className="text-sm text-slate-500">
                              {rfq.supplier.location}
                            </p>
                          )}
                          {rfq.supplier.verified && (
                            <span className="text-xs text-emerald-700">
                              Verified Supplier
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">
                        {rfq.supplierOrgName || "No specific supplier assigned"}
                      </p>
                    )}
                  </div>

                  {/* RFQ Details */}
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 mt-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      RFQ Details
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Package className="size-5 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-sm text-slate-500">Quantity</span>
                          <p className="font-medium text-slate-900">
                            {rfq.quantity ?? "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Package className="size-5 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-sm text-slate-500">Target Unit Price</span>
                          <p className="font-medium text-slate-900">
                            {rfq.targetUnitPrice
                              ? `₱${rfq.targetUnitPrice.toLocaleString()}`
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="size-5 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-sm text-slate-500">Expected Delivery</span>
                          <p className="font-medium text-slate-900">
                            {rfq.expectedDeliveryDate
                              ? new Date(rfq.expectedDeliveryDate).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="size-5 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-sm text-slate-500">Quotation Validity</span>
                          <p className="font-medium text-slate-900">
                            {rfq.validityDays ? `${rfq.validityDays} days` : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {rfq.notes && (
                      <div className="mt-4">
                        <span className="text-sm text-slate-500">Message</span>
                        <p className="mt-1 text-slate-700 whitespace-pre-wrap">
                          {rfq.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Conversation */}
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 mt-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Conversation
                    </h2>
                    <div className="space-y-4 h-80 overflow-y-auto">
                      {rfq.messages && rfq.messages.length > 0 ? (
                        rfq.messages.map((msg) => (
                          <MessageBubble key={msg.id} message={msg} />
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          No messages yet. Start the conversation by sending a message.
                        </p>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Reply box */}
                    <div className="mt-4">
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your message..."
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleSendReply}
                          disabled={isSending || !reply.trim()}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <SendIcon className="size-4" />
                          {isSending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Timeline + Agent Info */}
                <div className="space-y-6">
                  {/* Status badge */}
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusBadge
                          status={(statusConfig.label as RfqStatus) || "SUBMITTED"}
                        />
                        <span className="text-sm text-slate-500">
                          RFQ #{rfq.rfqNumber}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        Created: {new Date(rfq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <StatusTimeline status={rfq.status} />
                  </div>

                  {/* Agent Info */}
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Agent
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <User className="size-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {rfq.agentName}
                        </p>
                        <p className="text-sm text-slate-500">
                          Created {new Date(rfq.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AgentAuthProvider>
  );
}
