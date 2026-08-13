"use client";

import { Package, FileText, Check, X, MessageSquare } from "lucide-react";
import FinancialSummary from "./FinancialSummary";
import PriceBreakdown, { resolveBreakdown } from "./PriceBreakdown";
import type { NegotiationOffer } from "@/types/wholesale";

interface CounterOfferCardProps {
  offer: NegotiationOffer;
  isLatest?: boolean;
  isFromSupplier?: boolean;
  supplierName?: string;
  buyerName?: string;
  onAccept?: (offerId: string) => void;
  onCounter?: (offer: NegotiationOffer) => void;
  onReject?: (offerId: string) => void;
  // VAT context — pass through from the product/supplier item when the
  // caller has it directly (e.g. rendering a raw NegotiationOffer record
  // that isn't backed by a ConversationMessage.metadata payload).
  vatRate?: number;
  isVatExempt?: boolean;
}

export default function CounterOfferCard({
  offer,
  isLatest = false,
  isFromSupplier = false,
  supplierName = "Supplier",
  buyerName = "You",
  onAccept,
  onCounter,
  onReject,
  vatRate,
  isVatExempt,
}: CounterOfferCardProps) {
  const canAct = isLatest && isFromSupplier && offer.status === "PENDING";
  const isAccepted = offer.status === "ACCEPTED";
  const isRejected = offer.status === "REJECTED";

  const statusColor =
    isAccepted
      ? "bg-emerald-100 text-emerald-700"
      : isRejected
        ? "bg-red-100 text-red-700"
        : "bg-slate-100 text-slate-600";

  const senderLabel = isFromSupplier ? supplierName : buyerName;
  const headerLabel = isFromSupplier ? "Supplier Offer" : "Your Offer";

  // Do not hardcode the final total, do not apply VAT twice — derive
  // everything from the offer's own quantity/unitPrice. If explicit
  // vatRate/isVatExempt props were passed use those; otherwise fall back to
  // the platform default (12%, not exempt).
  const breakdown = resolveBreakdown(
    { vatRate, isVatExempt },
    offer.unitPrice,
    offer.quantity,
  );

  return (
    <div className="my-2 max-w-[80%] rounded-xl border border-slate-200 bg-slate-50 p-4">
      {/* Header with sender info */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-500">
            {headerLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{senderLabel}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
          >
            {offer.status}
          </span>
        </div>
      </div>

      {/* Financial summary */}
      <div className="mb-3">
        <FinancialSummary
          quantity={offer.quantity}
          unitPrice={offer.unitPrice}
          deliveryDate={offer.deliveryDate ?? null}
          leadTime={offer.estimatedLeadTime ?? null}
        />
      </div>

      {/* Full price breakdown — Subtotal, VAT (or Exempt), Total */}
      <div className="mb-3">
        <PriceBreakdown {...breakdown} tone="neutral" />
      </div>

      {offer.notes && (
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <FileText className="size-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-xs text-slate-500">Notes</span>
              <p className="text-sm text-slate-700">{offer.notes}</p>
            </div>
          </div>
        </div>
      )}

      {offer.validUntil && (
        <div className="mb-2 text-xs text-slate-500">
          Expires: {new Date(offer.validUntil).toLocaleDateString()}
        </div>
      )}

      {/* Action buttons — only for the latest pending supplier offer */}
      {canAct && (
        <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
          <button
            onClick={() => onAccept?.(offer.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Check className="size-4" />
            Accept
          </button>
          <button
            onClick={() => onCounter?.(offer)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <MessageSquare className="size-4" />
            Counter Offer
          </button>
          <button
            onClick={() => onReject?.(offer.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <X className="size-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}