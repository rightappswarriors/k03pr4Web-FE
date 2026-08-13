"use client";

import { XCircle, Tag } from "lucide-react";
import FinancialSummary from "./FinancialSummary";
import PriceBreakdown, { resolveBreakdown } from "./PriceBreakdown";
import type { ConversationMessage, NegotiationOffer } from "@/types/wholesale";

interface OfferRejectedCardProps {
  message: ConversationMessage;
  offer?: NegotiationOffer;
  senderRole: "AGENT" | "SUPPLIER";
}

export default function OfferRejectedCard({
  message,
  offer,
  senderRole,
}: OfferRejectedCardProps) {
  const meta = message.metadata ?? {};
  const reason = meta.reason ?? message.message ?? "No reason provided";

  const quantity = meta.quantity ?? offer?.quantity ?? 0;
  const unitPrice = meta.unitPrice ?? offer?.unitPrice ?? 0;

  const senderLabel =
    senderRole === "AGENT" ? "Agent" : "Supplier";

  // Prefers the backend-computed subtotal/vatAmount/total from `metadata`
  // (set by rfqNegotiation.service.ts's rejectOffer) — only falls back to a
  // client-side 12% estimate for records created before that fix shipped.
  const breakdown = resolveBreakdown(meta, unitPrice, quantity);

  return (
    <div className="my-2 max-w-[85%] rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <XCircle className="size-5 text-red-700" />
        <h3 className="text-sm font-semibold text-red-900">
          Negotiation Rejected
        </h3>
      </div>

      <div className="mb-2 text-xs text-red-700">
        Rejected by {senderLabel}
      </div>

      <div className="mb-3">
        <FinancialSummary
          quantity={quantity}
          unitPrice={unitPrice}
          deliveryDate={offer?.deliveryDate ?? null}
        />
      </div>

      <div className="mb-3">
        <PriceBreakdown {...breakdown} tone="red" />
      </div>

      <div className="rounded-lg bg-red-100 px-3 py-2">
        <div className="flex items-start gap-2">
          <Tag className="size-3 text-red-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-medium text-red-800">Reason</span>
            <p className="text-xs text-red-700 mt-1">{reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}