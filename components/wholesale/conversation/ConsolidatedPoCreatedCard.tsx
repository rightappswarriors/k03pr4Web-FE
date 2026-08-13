"use client";

import { Package, FileText, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { formatDateSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

interface ConsolidatedPoCreatedCardProps {
  message: ConversationMessage;
  onViewPO?: (poId: string) => void;
  rfqCount?: number;
}

export default function ConsolidatedPoCreatedCard({
  message,
  onViewPO,
  rfqCount,
}: ConsolidatedPoCreatedCardProps) {
  const meta = message.metadata ?? {};

  const poNumber = meta.poNumber ?? "—";
  const poId = meta.poId ?? null;
  const totalAmount = meta.totalAmount;
  const totalVat = meta.totalVat;
  const deliveryDate = meta.deliveryDate ?? null;
  const createdAt = meta.createdAt ?? message.createdAt;
  const rfqIds: string[] = meta.rfqIds ?? [];
  const lineItems = meta.poLineItems ?? [];

  return (
    <div className="my-2 max-w-[90%] rounded-xl border border-purple-200 bg-purple-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Package className="size-5 text-purple-700" />
        <h3 className="text-sm font-semibold text-purple-900">
          Consolidated Purchase Order Created
        </h3>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-slate-500">PO Number</span>
          <p className="font-medium text-slate-900 font-mono">{poNumber}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">RFQs Consolidated</span>
          <p className="font-medium text-slate-900">
            {rfqCount ?? rfqIds.length ?? 0}
          </p>
        </div>
        {totalAmount != null && (
          <div>
            <span className="text-xs text-slate-500">Grand Total</span>
            <p className="font-bold text-lg text-slate-900">
              {formatPrice(totalAmount)}
            </p>
          </div>
        )}
        {totalVat != null && (
          <div>
            <span className="text-xs text-slate-500">Total VAT</span>
            <p className="font-medium text-slate-900">{formatPrice(totalVat)}</p>
          </div>
        )}
        {deliveryDate && (
          <div className="col-span-2 flex items-center gap-2">
            <Calendar className="size-4 text-slate-400" />
            <div>
              <span className="text-xs text-slate-500">Delivery Date</span>
              <p className="font-medium text-slate-900">
                {formatDateSafe(deliveryDate)}
              </p>
            </div>
          </div>
        )}
      </div>

      {createdAt && (
        <div className="mb-2 text-xs text-slate-500">
          Created: {formatDateSafe(createdAt)}
        </div>
      )}

      {lineItems.length > 0 && (
        <div className="mb-3 space-y-1">
          {lineItems.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-slate-600">
                {item.name ?? item.supplierItem?.name ?? "Item"} × {item.qty ?? 1}
              </span>
              <span className="text-slate-900">
                {formatPrice(item.subtotal ?? (item.unitPrice * (item.qty ?? 1)))}
              </span>
            </div>
          ))}
        </div>
      )}

      {poId && onViewPO && (
        <button
          onClick={() => onViewPO(poId)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:text-purple-800"
        >
          View Purchase Order
        </button>
      )}
    </div>
  );
}
