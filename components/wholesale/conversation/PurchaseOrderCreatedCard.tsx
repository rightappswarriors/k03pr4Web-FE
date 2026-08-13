"use client";

import { FileText, Calendar, Package, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { formatDateSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

interface PurchaseOrderCreatedCardProps {
  message: ConversationMessage;
  onViewPO?: (poId: string) => void;
}

export default function PurchaseOrderCreatedCard({
  message,
  onViewPO,
}: PurchaseOrderCreatedCardProps) {
  const meta = message.metadata ?? {};

  const poNumber = meta.poNumber ?? "—";
  const poId = meta.poId ?? null;
  const totalAmount = meta.totalAmount;
  const vatAmount = meta.vatAmount;
  const supplierName = meta.supplierName ?? "—";
  const buyerName = meta.buyerName ?? "—";
  const createdAt = meta.createdAt ?? message.createdAt;
  const deliveryDate = meta.deliveryDate ?? null;
  const status = meta.poStatus ?? meta.status ?? "PENDING";
  const poLineItems = meta.poLineItems ?? [];

  return (
    <div className="my-2 max-w-[90%] rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="size-5 text-blue-700" />
        <h3 className="text-sm font-semibold text-blue-900">
          Purchase Order Created
        </h3>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-slate-500">PO Number</span>
          <p className="font-medium text-slate-900 font-mono">{poNumber}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Status</span>
          <p className="font-medium text-slate-900">{status}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Buyer</span>
          <p className="font-medium text-slate-900">{buyerName}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Supplier</span>
          <p className="font-medium text-slate-900">{supplierName}</p>
        </div>
        {totalAmount != null && (
          <div>
            <span className="text-xs text-slate-500">Grand Total</span>
            <p className="font-bold text-slate-900">{formatPrice(totalAmount)}</p>
          </div>
        )}
        {vatAmount != null && (
          <div>
            <span className="text-xs text-slate-500">VAT</span>
            <p className="font-medium text-slate-900">{formatPrice(vatAmount)}</p>
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

      {poLineItems.length > 0 && (
        <div className="mb-3 space-y-1">
          {poLineItems.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-slate-600">
                {item.name ?? item.supplierItem?.name ?? "Item"} × {item.qty ?? item.quantity ?? 1}
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800"
        >
          View Purchase Order
          <ExternalLink className="size-3" />
        </button>
      )}
    </div>
  );
}
