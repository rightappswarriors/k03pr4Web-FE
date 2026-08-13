"use client";

import { CreditCard, Calendar, Receipt } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { formatDateSafe, formatTimeSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

interface PaymentReceivedCardProps {
  message: ConversationMessage;
  onViewReceipt?: (url: string) => void;
}

export default function PaymentReceivedCard({ message, onViewReceipt }: PaymentReceivedCardProps) {
  const meta = message.metadata ?? {};

  const amount = meta.amount ?? 0;
  const paymentMethod = meta.paymentMethod ?? meta.method ?? "Bank Transfer";
  const referenceNumber = meta.referenceNumber ?? meta.refNumber ?? null;
  const paidByName = meta.paidByName ?? "System";
  const receiptUrl = meta.receiptUrl ?? meta.fileUrl ?? null;
  const paymentDate = meta.paidAt ?? meta.paymentDate ?? message.createdAt;

  return (
    <div className="my-2 max-w-[90%] rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard className="size-5 text-emerald-700" />
        <h3 className="text-sm font-semibold text-emerald-900">Payment Received</h3>
      </div>

      <div className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Amount</span>
          <p className="font-bold text-slate-900">{formatPrice(amount)}</p>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Payment Method</span>
          <p className="font-medium text-slate-900">{paymentMethod}</p>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Paid By</span>
          <p className="font-medium text-slate-900">{paidByName}</p>
        </div>
        {referenceNumber && (
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Reference No.</span>
            <p className="font-medium text-slate-900 font-mono">{referenceNumber}</p>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Payment Date</span>
          <p className="font-medium text-slate-900">{formatDateSafe(paymentDate)}</p>
        </div>
      </div>

      {receiptUrl && onViewReceipt && (
        <button
          onClick={() => onViewReceipt(receiptUrl)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
        >
          View Receipt
          <Receipt className="size-3" />
        </button>
      )}

      <p className="mt-1 text-xs text-slate-400">
        {formatTimeSafe(message.createdAt)}
      </p>
    </div>
  );
}
