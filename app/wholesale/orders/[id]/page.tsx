"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  CreditCard,
  MapPin,
  MessageSquare,
  ReceiptText,
  Send,
} from "lucide-react";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";
import { useSocket } from "@/providers/SocketProvider";
import { purchaseOrderApi, type PaymentAttemptResult } from "@/services/purchase-order.service";
import { formatPrice } from "@/lib/utils";
import { ConversationEventCard } from "@/components/wholesale/conversation";
import { DeliveryLocationPicker, type DeliveryLocation } from "@/components/wholesale/DeliveryLocationPicker";
import type { PurchaseOrder } from "@/types/wholesale";

const statusLabel = (s: string) =>
  (
    ({
      PENDING: "Pending Review",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      IN_TRANSIT: "In Delivery",
      DELIVERED: "Completed",
      CANCELLED: "Cancelled",
    }) as Record<string, string>
  )[s] ?? s;
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { subscribe } = useSocket();
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<"accept" | "reject" | "payment" | "receipt" | "location" | null>(null);
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<"CARD" | "CASH" | "E_WALLET">("E_WALLET");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("");
  const [paymentStep, setPaymentStep] = useState(1);
  const [location, setLocation] = useState<DeliveryLocation>({ address: "", latitude: null, longitude: null });
  const [locationDraft, setLocationDraft] = useState<DeliveryLocation>({ address: "", latitude: null, longitude: null });
  const [instructions, setInstructions] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentAttemptNotice, setPaymentAttemptNotice] = useState<string | null>(null);
  const [paymentAttemptResult, setPaymentAttemptResult] = useState<PaymentAttemptResult | null>(null);
  const [message, setMessage] = useState("");
  const [mobileTab, setMobileTab] = useState<"details" | "conversation">("details");
  const load = useCallback(async () => {
    setError(null);
    try {
      const next = await purchaseOrderApi.get(id);
      setPo(next);
      setDate(next.delivery?.scheduledDate?.slice(0, 10) ?? "");
      setLocation({ address: next.delivery?.address ?? "", latitude: next.delivery?.latitude ?? null, longitude: next.delivery?.longitude ?? null });
      setInstructions(next.delivery?.notes ?? "");
      setRecipientName(next.delivery?.recipientName ?? "");
      setRecipientContact(next.delivery?.recipientContact ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Purchase Order.");
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(
    () =>
      subscribe(({ event, payload }) => {
        if (event.startsWith("purchaseOrder:") && (!payload?.poId || payload.poId === id))
          void load();
      }),
    [subscribe, id, load],
  );
  const perform = async (fn: () => Promise<PurchaseOrder>) => {
    setBusy(true);
    setError(null);
    try {
      setPo(await fn());
      setModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't update this purchase order.");
    } finally {
      setBusy(false);
    }
  };
  const continueToPayment = async () => {
    if (!po) return;
    setBusy(true); setError(null); setPaymentAttemptNotice(null);
    try {
      const payment = await purchaseOrderApi.beginPayment(po.id);
      if (payment.checkoutUrl) {
        window.location.assign(payment.checkoutUrl);
        return;
      }
      setPaymentAttemptResult(payment);
      setPaymentAttemptNotice(payment.message ?? (payment.confirmed ? 'Payment Confirmed.' : 'Checking payment status with Maya.'));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to prepare the Maya checkout.');
    } finally {
      setBusy(false);
    }
  };
  const retryVerification = async () => {
    const transactionId = po?.paymentAttempt?.id;
    if (!transactionId) return;
    setBusy(true); setError(null); setPaymentAttemptNotice(null);
    try {
      const payment = await purchaseOrderApi.reconcilePayment(transactionId);
      setPaymentAttemptResult(payment);
      setPaymentAttemptNotice(payment.message ?? (payment.confirmed
        ? 'Payment Confirmed.'
        : payment.active
          ? 'Payment session is active and ready to continue.'
          : payment.canRetry
            ? 'This payment attempt is no longer active. You can try again.'
            : 'Payment status still requires verification with Maya.'));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to verify the Maya payment status.');
    } finally {
      setBusy(false);
    }
  };
  if (!po)
    return (
      <AgentAuthProvider>
        <main className="min-h-screen bg-[#f7f7f5]">
          <Header wholesale />
          <div className="container-shell py-10">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 h-72 animate-pulse rounded-xl bg-slate-200" />
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}{" "}
                <button onClick={() => void load()} className="font-semibold underline">
                  Try again
                </button>
              </div>
            )}
          </div>
        </main>
      </AgentAuthProvider>
    );
  const subtotal = po.subtotalAmount;
  const charges = po.extraCharges ?? [];
  // Guard against a response where these arrays weren't populated (e.g. a
  // partial/optimistic payload) — without this, `.map`/`.length` throws.
  const lineItems = po.lineItems ?? [];
  const rfqs = po.rfqs ?? [];
  const isSupplierConfirmed = po.supplierConfirmation === "CONFIRMED";
  const attemptStatus = po.paymentAttempt?.status;
  const terminalAttempt = attemptStatus === "EXPIRED" || attemptStatus === "FAILED" || attemptStatus === "CANCELLED";
  const reconciliationAttempt = attemptStatus === "RECONCILIATION_REQUIRED";
  const verifiedCheckoutUrl = paymentAttemptResult?.transactionId === po.paymentAttempt?.id && paymentAttemptResult?.active
    ? paymentAttemptResult.checkoutUrl
    : undefined;
  // A stored checkout URL is never trusted after a processing attempt. It may
  // be reused only when the reconciliation endpoint has verified it is active.
  const reconciliationRequired = reconciliationAttempt || (!terminalAttempt && !verifiedCheckoutUrl && (attemptStatus === "PENDING" || attemptStatus === "PROCESSING" || attemptStatus === "AWAITING_PAYMENT"));
  const paymentAttemptTitle = terminalAttempt
    ? attemptStatus === "EXPIRED" ? "Payment Session Expired" : attemptStatus === "CANCELLED" ? "Payment Cancelled" : "Payment Failed"
    : reconciliationAttempt ? "Payment Verification Required"
    : attemptStatus === "AWAITING_PAYMENT" ? "Payment Awaiting Completion"
    : "Payment Prepared";
  const paymentAttemptCopy = terminalAttempt
    ? attemptStatus === "EXPIRED" ? "This payment session has expired." : attemptStatus === "CANCELLED" ? "No payment was confirmed." : "Your payment was not completed. No payment was confirmed for this attempt."
    : reconciliationAttempt ? "Maya reported this payment as completed, but Kompra cannot independently verify it yet."
    : reconciliationRequired ? "Checking payment status with Maya..." : "Awaiting payment confirmation.";
  const paymentAttemptButton = terminalAttempt ? "Try Payment Again" : "Continue to Payment";
  const receipt = po.receiptSnapshot as Record<string, unknown> | null;
  const hasReceipt = po.paymentStatus === "PAID" && Boolean(receipt?.confirmedAt || receipt?.paidAt);
  const shownPaymentStatus = po.paymentStatus === "PAID" && !hasReceipt ? (po.paymentPreparedAt ? "PREPARING" : "PENDING") : po.paymentStatus;
  const Details = (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Order items</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {lineItems.map((item) => (
            <div key={item.id} className="flex gap-3 p-4 sm:items-center sm:gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {item.supplierItem.image ? (
                  <img
                    className="h-full w-full object-cover"
                    src={item.supplierItem.image}
                    alt=""
                  />
                ) : (
                  <ClipboardList className="size-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {item.itemName || item.supplierItem.name}
                </p>
                <p className="text-xs text-slate-500">
                  SKU: {item.itemSku || item.supplierItem.sku || "—"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatPrice(item.unitPrice)} × {item.qty} {item.supplierItem.unit ?? ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{formatPrice(item.subtotal)}</p>
                <p className="text-xs text-slate-500">VAT included</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Order Total</h2>
        <div className="mt-4 ml-auto max-w-sm space-y-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Merchandise Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>VAT</span>
            <span>{formatPrice(po.vatAmount)}</span>
          </div>
          <div className="pt-1 text-slate-600">
            <div className="flex justify-between">
              <span>Additional Charges</span>
              <span>{formatPrice(po.extraChargesTotal)}</span>
            </div>
            {charges.map((charge, index) => (
              <div key={`${charge.code}-${index}`} className="mt-2 flex justify-between pl-3 text-xs">
                <span>{charge.label}</span>
                <span>{formatPrice(charge.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Grand Total</span>
            <span>{formatPrice(po.totalAmount)}</span>
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">
          {rfqs.length ? `Source RFQs (${rfqs.length})` : "Manual Purchase Order"}
        </h2>
        {rfqs.length ? (
          <div className="mt-3 space-y-2">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{rfq.rfqNumber}</p>
                  <p className="text-xs text-slate-500">{rfq.status.replaceAll("_", " ")}</p>
                </div>
                <Link
                  href={`/wholesale/inbox/${rfq.id}`}
                  className="font-semibold text-[#287c72] hover:underline"
                >
                  View RFQ
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            This PO was created directly and does not have an RFQ.
          </p>
        )}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-[#287c72]" />
          <h2 className="font-semibold text-slate-900">Delivery</h2>
        </div>
        {po.status === "PENDING" || po.status === "REJECTED" ? (
          <p className="mt-3 text-sm text-slate-500">
            Delivery information can be prepared after this order is accepted.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Set the expected delivery details for the supplier.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Expected delivery date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">Delivery address
                <input value={location.address} onChange={(e) => setLocation({ ...location, address: e.target.value })} placeholder="City, province, address" className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" />
              </label>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">Delivery Location</p>
              {location.latitude != null && location.longitude != null ? <><p className="mt-1 text-sm text-slate-600">📍 {location.address || "Pinned delivery location"}</p><p className="mt-1 text-xs text-slate-500">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p><div className="mt-3 flex gap-3"><a href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#287c72]">View on Map</a><button type="button" onClick={() => { setLocationDraft(location); setModal("location"); }} className="text-sm font-semibold cursor-pointer text-[#287c72]">Change Location</button></div></> : <><p className="mt-1 text-sm text-slate-500">No delivery location selected</p><button type="button" onClick={() => { setLocationDraft(location); setModal("location"); }} className="mt-3 rounded-lg border border-[#287c72] px-3 py-2 text-sm font-semibold text-[#287c72]">Select Delivery Location</button></>}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Recipient name<input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" /></label><label className="text-sm font-medium text-slate-700">Recipient contact<input value={recipientContact} onChange={(e) => setRecipientContact(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" /></label></div>
            <label className="mt-3 block text-sm font-medium text-slate-700">Delivery instructions<textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" /></label>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await purchaseOrderApi.updateDelivery(po.id, {
                    scheduledDate: date || undefined,
                    address: location.address || undefined,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    notes: instructions || undefined,
                    recipientName: recipientName || undefined,
                    recipientContact: recipientContact || undefined,
                  });
                  await load();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Unable to save delivery information.");
                } finally {
                  setBusy(false);
                }
              }}
              className="mt-4 cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Save delivery information
            </button>
          </>
        )}
      </section>
    </div>
  );
  const Conversation = (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-[#287c72]" />
        <div>
          <h2 className="font-semibold text-slate-900">Purchase order conversation</h2>
          <p className="text-xs text-slate-500">
            Discuss this purchase order directly with the supplier.
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {po.conversation?.messages?.length ? (
          po.conversation.messages.map((msg) => (
            <ConversationEventCard
              key={msg.id}
              event={{ kind: "message", data: msg }}
              supplierName={po.supplier?.name ?? "Supplier"}
            />
          ))
        ) : (
          <p className="rounded-lg bg-slate-50 px-4 py-7 text-center text-sm text-slate-500">
            No messages yet. Use this conversation to discuss this Purchase Order with the supplier.
          </p>
        )}
      </div>
      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          placeholder="Message supplier"
        />
        <button
          disabled={!message.trim() || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await purchaseOrderApi.sendMessage(po.id, message);
              setMessage("");
              await load();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to send message.");
            } finally {
              setBusy(false);
            }
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#287c72] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </section>
  );
  return (
    <AgentAuthProvider>
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="min-w-0 flex-1">
            <div className="container-shell py-6 sm:py-8">
              <Link
                href="/wholesale/orders"
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#287c72]"
              >
                <ArrowLeft className="size-4" />
                Purchase Orders
              </Link>
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {po.poNumber}
                    </h1>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                      {statusLabel(po.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-800">
                      {po.supplier?.name ?? "Supplier"}
                    </span>{" "}
                    · Created{" "}
                    {new Date(po.createdAt).toLocaleDateString("en-PH", { dateStyle: "long" })} ·{" "}
                    {rfqs.length
                      ? `${rfqs.length} RFQ${rfqs.length > 1 ? "s" : ""}`
                      : "Manual purchase order"}
                  </p>
                </div>
              </div>
              <div className="mb-5 flex rounded-lg bg-slate-200 p-1 md:hidden">
                <button
                  onClick={() => setMobileTab("details")}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold ${mobileTab === "details" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                >
                  Details
                </button>
                <button
                  onClick={() => setMobileTab("conversation")}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold ${mobileTab === "conversation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                >
                  Conversation
                </button>
              </div>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
                <div className={mobileTab === "conversation" ? "hidden md:block" : ""}>
                  {Details}
                  <div className="mt-6 hidden md:block">{Conversation}</div>
                </div>
                <aside
                  className={
                    mobileTab === "conversation"
                      ? "hidden md:block"
                      : "space-y-5 xl:sticky xl:top-5 xl:self-start"
                  }
                >
                  <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order status
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">Supplier Confirmation</h2>
                    {po.supplierConfirmation === "REVIEW_REQUIRED" && (
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Awaiting Supplier Confirmation. Payment will be available after the supplier accepts this order.</p>
                    )}
                    {po.supplierConfirmation === "DECLINED" && (
                      <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800"><span className="font-semibold">Order Declined by Supplier.</span>{po.rejectionReason ? ` Reason: ${po.rejectionReason}` : ""}</p>
                    )}
                    {isSupplierConfirmed && (
                      <p className="mt-2 text-sm text-emerald-700">Supplier Confirmed{po.source === "RFQ" ? " from accepted quotation" : ""}.</p>
                    )}
                    {isSupplierConfirmed && po.paymentStatus === "PENDING" && (
                      <>
                        <p className="mt-2 text-sm text-slate-600">
                          The order is ready for payment preparation.
                        </p>
                        <button
                          disabled={busy}
                          onClick={() => { setPaymentError(null); setPaymentStep(1); setModal("payment"); }}
                          className="mt-5 flex w-full items-center cursor-pointer justify-center gap-2 rounded-lg bg-[#287c72] py-2.5 text-sm font-semibold text-white"
                        >
                          <CreditCard className="size-4" />
                          Prepare Payment
                        </button>
                      </>
                    )}
                    {isSupplierConfirmed && po.paymentStatus === "PREPARING" && (
                      <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                        <p><span className="font-semibold">{paymentAttemptTitle}.</span> {paymentAttemptCopy}</p>
                        {paymentAttemptNotice && <p className="mt-2 text-xs text-amber-800">{paymentAttemptNotice}</p>}
                        {reconciliationRequired && <button disabled={busy} onClick={retryVerification} className="mt-3 cursor-pointer rounded-lg bg-[#287c72] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                          {busy ? "Verifying with Maya..." : "Retry Verification"}
                        </button>}
                        {verifiedCheckoutUrl && <button disabled={busy} onClick={() => window.location.assign(verifiedCheckoutUrl)} className="mt-3 cursor-pointer rounded-lg bg-[#287c72] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                          {busy ? 'Preparing Maya checkout…' : 'Continue to Payment'}
                        </button>}
                        {!attemptStatus && <button disabled={busy} onClick={continueToPayment} className="mt-3 cursor-pointer rounded-lg bg-[#287c72] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                          {busy ? 'Preparing Maya checkout…' : 'Continue to Payment'}
                        </button>}
                        {terminalAttempt && <button disabled={busy} onClick={continueToPayment} className="mt-3 cursor-pointer rounded-lg bg-[#287c72] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                          {busy ? 'Preparing a new Maya checkout…' : paymentAttemptButton}
                        </button>}
                      </div>
                    )}
                  </section>
                  <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {shownPaymentStatus === "PENDING" ? "Payment Pending" : shownPaymentStatus === "PREPARING" ? "Payment Prepared · Awaiting Payment" : shownPaymentStatus === "PAID" ? "Payment Confirmed" : shownPaymentStatus}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {hasReceipt ? "Amount paid" : "Amount due"}{" "}
                      <span className="font-semibold text-slate-900">
                        {formatPrice(po.totalAmount)}
                      </span>
                    </p>
                    {hasReceipt && (
                      <>
                        <p className="mt-2 text-xs text-slate-500">Paid via {String(receipt?.provider ?? "Maya").replace("PAYMAYA", "Maya")}</p>
                        {receipt?.providerReference && <p className="mt-1 break-all text-xs text-slate-500">Reference: {String(receipt.providerReference)}</p>}
                        {receipt?.confirmedAt && <p className="mt-1 text-xs text-slate-500">Paid: {new Date(String(receipt.confirmedAt)).toLocaleString("en-PH")}</p>}
                      </>
                    )}
                    {po.paymentPreparedAt && (
                      <p className="mt-2 text-xs text-slate-500">
                        Preparation saved · {po.paymentMethod?.replace("_", " ")}
                      </p>
                    )}
                  </section>
                  <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="size-5 text-[#287c72]" />
                      <h2 className="font-semibold text-slate-900">{hasReceipt ? "Receipt" : "Order Statement"}</h2>
                    </div>
                    {hasReceipt ? (
                      <>
                        <p className="mt-3 text-sm font-medium text-slate-800">Receipt available</p>
                        <p className="text-sm text-slate-600">
                          Total {formatPrice(po.totalAmount)}
                        </p>
                        <button
                          onClick={() => setModal("receipt")}
                          className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#287c72] cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">This is an order statement. A payment receipt is available only after verified payment.</p>
                    )}
                  </section>
                </aside>
              </div>
              <div className={mobileTab === "conversation" ? "mt-0 md:hidden" : "hidden"}>
                {Conversation}
              </div>
            </div>
          </div>
        </div>
      </main>
      {modal === "accept" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-bold">Accept Purchase Order?</h2>
          <p className="mt-2 text-sm text-slate-600">
            {po.poNumber} · {lineItems.length} items ·{" "}
            <span className="font-semibold text-slate-900">{formatPrice(po.totalAmount)}</span>
          </p>
          <p className="mt-3 text-sm text-slate-600">
            You are confirming that the purchase-order details are correct.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setModal(null)}
              className="rounded-lg px-3 py-2 text-sm cursor-pointer font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              disabled={busy}
              onClick={() => perform(() => purchaseOrderApi.accept(po.id))}
              className="rounded-lg bg-[#287c72] px-4 py-2 text-sm font-semibold text-white"
            >
              Accept Purchase Order
            </button>
          </div>
        </Modal>
      )}
      {modal === "reject" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-bold">Reject Purchase Order</h2>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Reason *
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please tell the supplier why this PO cannot be accepted."
              className="mt-1.5 min-h-28 w-full rounded-lg border border-slate-200 p-3 font-normal"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setModal(null)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              disabled={busy || !reason.trim()}
              onClick={() => perform(() => purchaseOrderApi.reject(po.id, reason))}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Reject Purchase Order
            </button>
          </div>
        </Modal>
      )}
      {modal === "payment" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-bold">Prepare Payment</h2>
          <p className="mt-2 text-sm text-slate-600">
            {po.poNumber} · {po.supplier?.name ?? "Supplier"}
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between">
              <span>Amount due</span>
              <strong>{formatPrice(po.totalAmount)}</strong>
            </div>
            <p className="mt-2 text-xs text-slate-500">No payment will be processed yet.</p>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#287c72]">STEP 2 · DELIVERY</p>
          <label className="mt-2 block text-sm font-semibold">
            Expected delivery date *
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" />
          </label>
          <div className="mt-3">
            <DeliveryLocationPicker value={location} onChange={setLocation} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">Recipient name<input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" /></label>
            <label className="text-sm font-semibold">Recipient contact<input value={recipientContact} onChange={(e) => setRecipientContact(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" /></label>
          </div>
          <label className="mt-3 block text-sm font-semibold">Delivery instructions<textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" /></label>
          {paymentError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{paymentError}</p>}
          <label className="mt-4 block text-sm font-semibold">
            Payment method
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal"
            >
              <option value="E_WALLET">Digital Wallet</option>
              <option value="CARD">Card</option>
              <option value="CASH">Bank Transfer / Other</option>
            </select>
          </label>
          <label className="mt-3 block text-sm font-semibold">
            Reference (optional)
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal"
              placeholder="Internal payment reference"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setModal(null)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              disabled={busy}
              onClick={() => {
                if (!date || !location.address.trim()) {
                  setPaymentError(!date ? "Expected delivery date is required." : "Delivery address is required.");
                  return;
                }
                setPaymentError(null);
                perform(() => purchaseOrderApi.preparePayment(po.id, method, { scheduledDate: date, address: location.address, latitude: location.latitude, longitude: location.longitude, notes: instructions, recipientName, recipientContact }, reference));
              }}
              className="rounded-lg cursor-pointer bg-[#287c72] px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm Payment Preparation
            </button>
          </div>
        </Modal>
      )}
      {modal === "location" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-bold text-slate-900">Select Delivery Location</h2>
          <p className="mt-1 text-sm text-slate-600">Choose a point on the map, drag the marker, or use your current location. Nothing is saved until you confirm.</p>
          <div className="mt-4">
            <DeliveryLocationPicker value={locationDraft} onChange={setLocationDraft} />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 cursor-pointer">Cancel</button>
            <button disabled={!locationDraft.address.trim()} onClick={() => { setLocation(locationDraft); setModal(null); }} className="rounded-lg bg-[#287c72] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer">Confirm Location</button>
          </div>
        </Modal>
      )}
      {modal === "receipt" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-bold">Kompra.ph Receipt</h2>
          <p className="mt-1 text-sm text-slate-600">Purchase Order {po.poNumber}</p>
          <div className="mt-4 space-y-2 border-y border-slate-100 py-4 text-sm">
            <div className="flex justify-between">
              <span>Buyer</span>
              <span>{receipt?.buyerName ? String(receipt.buyerName) : "Procurement agent"}</span>
            </div>
            <div className="flex justify-between">
              <span>Supplier</span>
              <span>{po.supplier?.name ?? "Supplier"}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(po.totalAmount)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            PDF download will appear here when receipt storage and a PDF endpoint are available.
          </p>
          <button
            onClick={() => setModal(null)}
            className="mt-5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            Close
          </button>
        </Modal>
      )}
    </AgentAuthProvider>
  );
}
