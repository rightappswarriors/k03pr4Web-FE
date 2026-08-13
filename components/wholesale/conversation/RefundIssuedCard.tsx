"use client";

import { Receipt, Calendar, CreditCard, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { formatDateSafe, formatTimeSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

interface RefundIssuedCardProps {
  message: ConversationMessage;
  onViewReceipt?: (url: string) => void;
}

export default function RefundIssuedCard({ message, onViewReceipt }: RefundIssuedCardProps) {
  const meta = message.metadata ?? {};

  const amount = meta.amount ?? 0;
  const reason = meta.reason ?? message.message ?? "No reason provided";
  const refundedBy = meta.refundedBy ?? "System";
  const refundDate = meta.refundedAt ?? meta.refundDate ?? message.createdAt;
  const referenceNumber = meta.referenceNumber ?? meta.refNumber ?? null;
  const paymentMethod = meta.paymentMethod ?? meta.method ?? null;
  const isFullRefund = meta.isFullRefund ?? false;

  return (
    <div className="my-2 max-w-[90%] rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="size-5 text-amber-700" />
          <h3 className="text-sm font-semibold text-amber-900">Refund Issued</h3>
        </div>
        <span className={`text-xs font-medium ${isFullRefund ? "text-amber-800" : "text-amber-700"}`}>
          {isFullRefund ? "Full Refund" : "Partial Refund"}
        </span>
      </div>

      <div className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Refund Amount</span>
          <p className="font-bold text-slate-900">{formatPrice(amount)}</p>
        </div>

        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Processed By</span>
          <p className="font-medium text-slate-900">{refundedBy}</p>
        </div>

        {paymentMethod && (
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Original Method</span>
            <div className="flex items-center gap-1">
              <CreditCard className="size-3 text-slate-400" />
              <p className="font-medium text-slate-900">{paymentMethod}</p>
            </div>
          </div>
        )}

        {referenceNumber && (
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Reference No.</span>
            <p className="font-medium text-slate-900 font-mono">{referenceNumber}</p>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Refund Date</span>
          <p className="font-medium text-slate-900">{formatDateSafe(refundDate)}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-amber-100 p-3">
        <div className="flex items-start gap-2">
          <Tag className="size-4 text-amber-700 mt-0.5" />
          <div className="flex-1">
            <span className="text-xs font-medium text-amber-800 uppercase">
              Reason
            </span>
            <p className="mt-1 text-sm text-amber-900">{reason}</p>
          </div>
        </div>
      </div>

      <p className="mt-1 text-xs text-slate-400">
        {formatTimeSafe(message.createdAt)}
      </p>
    </div>
  );
}
