"use client";

import { Info, Calendar, Upload, CreditCard, Receipt, Truck } from "lucide-react";
import { formatDateSafe, formatTimeSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  RFQ_CREATED: <Info className="size-5 text-blue-700" />,
  SUPPLIER_CONFIRMED: <Info className="size-5 text-teal-700" />,
  ORDER_CREATED: <Calendar className="size-5 text-blue-700" />,
  CONSOLIDATED_PO_CREATED: <Calendar className="size-5 text-purple-700" />,
  PAYMENT_UPDATE: <CreditCard className="size-5 text-amber-700" />,
  PAYMENT_SUBMITTED: <CreditCard className="size-5 text-amber-700" />,
  PAYMENT_RECEIVED: <CreditCard className="size-5 text-emerald-700" />,
  DELIVERY_SCHEDULED: <Calendar className="size-5 text-blue-700" />,
  SHIPMENT_DISPATCHED: <Truck className="size-5 text-indigo-700" />,
  REFUND_ISSUED: <CreditCard className="size-5 text-amber-700" />,
  RECEIPT_UPLOADED: <Receipt className="size-5 text-emerald-700" />,
  DELIVERY_UPDATED: <Truck className="size-5 text-indigo-700" />,
  SYSTEM: <Info className="size-5 text-slate-700" />,
  TEXT: <Info className="size-5 text-slate-700" />,
};

interface SystemEventCardProps {
  message: ConversationMessage;
}

export default function SystemEventCard({ message }: SystemEventCardProps) {
  const icon = EVENT_ICONS[message.type] ?? <Info className="size-5 text-slate-700" />;
  const meta = message.metadata ?? {};

  // Build a human-readable title based on the event type
  let title = message.message;
  let details: React.ReactNode = null;

  switch (message.type) {
    case "PAYMENT_SUBMITTED":
      title = "Payment Submitted";
      details = meta.amount != null ? (
        <p className="text-xs text-slate-600 mt-1">
          Amount: ₱{meta.amount.toLocaleString()}
        </p>
      ) : null;
      break;

    case "PAYMENT_UPDATE":
      title = "Payment Updated";
      details = meta.amount != null ? (
        <p className="text-xs text-slate-600 mt-1">
          Amount: ₱{meta.amount.toLocaleString()}
        </p>
      ) : null;
      break;

    case "RECEIPT_UPLOADED":
      title = "Receipt Uploaded";
      details = meta.fileUrl ? (
        <a
          href={meta.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          View receipt
        </a>
      ) : null;
      break;

    case "DELIVERY_UPDATED":
      title = "Delivery Updated";
      details = meta.trackingNumber ? (
        <p className="text-xs text-slate-600 mt-1">
          Tracking: {meta.trackingNumber}
        </p>
      ) : null;
      break;

    case "RFQ_CREATED":
      title = "RFQ Created";
      break;

    case "FINAL_OFFER":
      title = "Final Offer";
      break;

    case "PAYMENT_RECEIVED":
      title = "Payment Received";
      details = meta.amount != null ? (
        <p className="text-xs text-slate-600 mt-1">
          Amount: ₱{meta.amount.toLocaleString()}
        </p>
      ) : null;
      break;

    case "DELIVERY_SCHEDULED":
      title = "Delivery Scheduled";
      details = meta.scheduledDate ? (
        <p className="text-xs text-slate-600 mt-1">
          Scheduled: {formatDateSafe(meta.scheduledDate)}
        </p>
      ) : null;
      break;

    case "SHIPMENT_DISPATCHED":
      title = "Shipment Dispatched";
      details = meta.trackingNumber ? (
        <p className="text-xs text-slate-600 mt-1">
          Tracking: {meta.trackingNumber}
        </p>
      ) : null;
      break;

    case "REFUND_ISSUED":
      title = "Refund Issued";
      details = meta.amount != null ? (
        <p className="text-xs text-slate-600 mt-1">
          Amount: ₱{meta.amount.toLocaleString()}
        </p>
      ) : null;
      break;

    default:
      // Use the message text as-is for unknown types
      if (message.message) title = message.message;
      break;
  }

  return (
    <div className="my-2 mx-auto max-w-[85%] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800">{title}</p>
          {details}
          <div className="mt-1 text-xs text-slate-400">
            {formatTimeSafe(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
