"use client";

import { CheckCircle2, Package } from "lucide-react";
import FinancialSummary from "./FinancialSummary";
import PriceBreakdown, { resolveBreakdown } from "./PriceBreakdown";
import type { ConversationMessage, NegotiationOffer } from "@/types/wholesale";

interface OfferAcceptedCardProps {
  message: ConversationMessage;
  offer?: NegotiationOffer;
  buyerName?: string;
}

export default function OfferAcceptedCard({
  message,
  offer,
  buyerName = "You",
}: OfferAcceptedCardProps) {
  const meta = message.metadata ?? {};

  const quantity = meta.quantity ?? offer?.quantity ?? 0;
  const unitPrice = meta.unitPrice ?? offer?.unitPrice ?? 0;
  const deliveryDate = meta.deliveryDate ?? offer?.deliveryDate ?? null;
  const leadTime = offer?.estimatedLeadTime ?? null;
  const acceptedByName = meta.acceptedByName ?? buyerName;

  // Prefers the backend-computed subtotal/vatAmount/total from `metadata`
  // (set by rfqNegotiation.service.ts's acceptOffer) — only falls back to a
  // client-side 12% estimate for records created before that fix shipped.
  const breakdown = resolveBreakdown(meta, unitPrice, quantity);

  return (
    <div className="my-2 max-w-[85%] rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="size-5 text-emerald-700" />
        <h3 className="text-sm font-semibold text-emerald-900">
          Negotiation Accepted
        </h3>
      </div>

      <div className="mb-2 text-xs text-emerald-700">
        Accepted by {acceptedByName}
      </div>

      <div className="mb-3">
        <FinancialSummary
          quantity={quantity}
          unitPrice={unitPrice}
          deliveryDate={deliveryDate}
          leadTime={leadTime}
        />
      </div>

      <div className="mb-3">
        <PriceBreakdown {...breakdown} tone="emerald" />
      </div>

      <div className="rounded-lg bg-emerald-100 px-3 py-2 text-xs text-emerald-800">
        Waiting for Supplier Confirmation
      </div>
    </div>
  );
}