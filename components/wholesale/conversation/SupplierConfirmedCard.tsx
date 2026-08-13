"use client";

import { CheckCircle2, User } from "lucide-react";
import { formatDateSafe } from "@/lib/financial";
import FinancialSummary from "./FinancialSummary";
import PriceBreakdown, { resolveBreakdown } from "./PriceBreakdown";
import type { ConversationMessage } from "@/types/wholesale";

interface SupplierConfirmedCardProps {
  message: ConversationMessage;
  supplierName?: string;
}

export default function SupplierConfirmedCard({
  message,
  supplierName = "Supplier",
}: SupplierConfirmedCardProps) {
  const meta = message.metadata ?? {};
  const confirmedByName = meta.supplierName ?? supplierName;
  const confirmedAt = meta.confirmedAt ?? message.createdAt;

  // NOTE: this event's `metadata` is written by a different backend service
  // (the supplier-side confirmSupplierAgreement flow) that only sends
  // acceptedPrice/acceptedQuantity — no subtotal/vatAmount/total yet, unlike
  // rfqNegotiation.service.ts's acceptOffer/rejectOffer. resolveBreakdown()
  // falls back to a client-side 12% estimate here until that service is
  // updated the same way (compute the breakdown server-side from the RFQ's
  // SupplierItem.isVatExempt/vatRate and include it in metadata).
  const quantity = meta.acceptedQuantity ?? meta.quantity ?? 0;
  const unitPrice = meta.acceptedPrice ?? meta.unitPrice ?? 0;
  const breakdown = resolveBreakdown(meta, unitPrice, quantity);

  return (
    <div className="my-2 max-w-[85%] rounded-xl border border-teal-200 bg-teal-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="size-5 text-teal-700" />
        <h3 className="text-sm font-semibold text-teal-900">
          Supplier Confirmed
        </h3>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-teal-700">
        <User className="size-3" />
        <span>Confirmed by {confirmedByName}</span>
      </div>

      <div className="mb-2 text-xs text-teal-700">
        {formatDateSafe(confirmedAt)}
      </div>

      {(quantity > 0 || unitPrice > 0) && (
        <div className="mb-3">
          <FinancialSummary quantity={quantity} unitPrice={unitPrice} deliveryDate={null} />
        </div>
      )}

      <div className="mb-3">
        <PriceBreakdown {...breakdown} tone="teal" />
      </div>

      <div className="text-xs text-teal-600">
        Purchase Order creation is now enabled.
      </div>
    </div>
  );
}