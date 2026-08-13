"use client";

import { formatPrice } from "@/lib/utils";

interface PriceBreakdownProps {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatRate?: number;
  isVatExempt?: boolean;
  tone?: "neutral" | "emerald" | "red" | "teal";
}

const TONE_STYLES: Record<
  NonNullable<PriceBreakdownProps["tone"]>,
  { border: string; totalText: string }
> = {
  neutral: { border: "border-slate-200", totalText: "text-slate-900" },
  emerald: { border: "border-emerald-200", totalText: "text-emerald-900" },
  red: { border: "border-red-200", totalText: "text-red-900" },
  teal: { border: "border-teal-200", totalText: "text-teal-900" },
};

export default function PriceBreakdown({
  subtotal,
  vatAmount,
  total,
  vatRate = 0.12,
  isVatExempt = false,
  tone = "neutral",
}: PriceBreakdownProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className={`rounded-lg border bg-white p-3 ${styles.border}`}>
      <div className="flex items-center justify-between py-0.5">
        <span className="text-xs text-slate-500">Subtotal</span>
        <span className="text-xs font-medium text-slate-700">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <span className="text-xs text-slate-500">
          VAT {isVatExempt ? "(Exempt)" : `(${Math.round(vatRate * 100)}%)`}
        </span>
        <span className="text-xs font-medium text-slate-700">{formatPrice(vatAmount)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5">
        <span className="text-xs font-semibold text-slate-900">Total</span>
        <span className={`text-sm font-bold ${styles.totalText}`}>{formatPrice(total)}</span>
      </div>
    </div>
  );
}

// Client-side fallback ONLY for records created before the backend started
// persisting subtotal/vatAmount/total in `metadata` (see rfqNegotiation.service.ts).
// Prefer backend-calculated values whenever they exist — this exists purely
// so old rows still render something reasonable instead of a blank card.
export function resolveBreakdown(meta: Record<string, any> | null | undefined, unitPrice: number, quantity: number) {
  const m = meta ?? {};
  if (m.subtotal != null && m.vatAmount != null && m.total != null) {
    return {
      subtotal: Number(m.subtotal),
      vatAmount: Number(m.vatAmount),
      total: Number(m.total),
      vatRate: m.vatRate != null ? Number(m.vatRate) : 0.12,
      isVatExempt: Boolean(m.isVatExempt),
    };
  }
  const vatRate = m.vatRate != null ? Number(m.vatRate) : 0.12;
  const isVatExempt = Boolean(m.isVatExempt);
  const subtotal = unitPrice * quantity;
  const vatAmount = isVatExempt ? 0 : subtotal * vatRate;
  return { subtotal, vatAmount, total: subtotal + vatAmount, vatRate, isVatExempt };
}