"use client";

import { Package, Calendar, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { computeFinancials } from "@/lib/financial";

interface FinancialSummaryProps {
  quantity: number;
  unitPrice: number;
  deliveryDate?: string | null;
  leadTime?: string | null;
  isVatExempt?: boolean;
  vatRate?: number;
  className?: string;
}

export default function FinancialSummary({
  quantity,
  unitPrice,
  deliveryDate,
  leadTime,
  isVatExempt = false,
  vatRate = 0.12,
  className = "",
}: FinancialSummaryProps) {
  const fin = computeFinancials(quantity, unitPrice, vatRate, isVatExempt);

  return (
    <div className={`grid grid-cols-2 gap-3 text-sm ${className}`}>
      <div className="flex items-start gap-2">
        <Package className="size-4 text-slate-400 mt-0.5" />
        <div>
          <span className="text-xs text-slate-500">Quantity</span>
          <p className="font-medium text-slate-900">
            {quantity % 1 === 0 ? String(quantity) : quantity.toFixed(2)} pcs
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <span className="text-xs text-slate-500">Unit Price</span>
        <p className="font-medium text-slate-900">{formatPrice(unitPrice)}</p>
      </div>

      <div className="flex items-start gap-2">
        <span className="text-xs text-slate-500">Subtotal</span>
        <p className="font-medium text-slate-900">{formatPrice(fin.subtotal)}</p>
      </div>

      <div className="flex items-start gap-2">
        <span className="text-xs text-slate-500">
          {isVatExempt ? "VAT (Exempt)" : `VAT (${Math.round(fin.vatRate * 100)}%)`}
        </span>
        <p className="font-medium text-slate-900">{formatPrice(fin.vatAmount)}</p>
      </div>

      <div className="col-span-2 flex items-start gap-2 border-t border-slate-200 pt-2 mt-1">
        <span className="text-xs text-slate-500">Grand Total</span>
        <p className="font-bold text-lg text-slate-900">
          {formatPrice(fin.grandTotal)}
        </p>
      </div>

      {deliveryDate && (
        <div className="flex items-start gap-2 col-span-2">
          <Calendar className="size-4 text-slate-400 mt-0.5" />
          <div>
            <span className="text-xs text-slate-500">Delivery Date</span>
            <p className="font-medium text-slate-900">
              {new Date(deliveryDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {leadTime && (
        <div className="flex items-start gap-2">
          <Clock className="size-4 text-slate-400 mt-0.5" />
          <div>
            <span className="text-xs text-slate-500">Lead Time</span>
            <p className="font-medium text-slate-900">{leadTime}</p>
          </div>
        </div>
      )}
    </div>
  );
}
