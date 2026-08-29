"use client";

import { Package } from "lucide-react";
import { formatProductPrice } from "@/lib/utils";
import type { ProductPriceTier } from "@/types/wholesale";

type ProductPriceTiersProps = {
  priceTiers: ProductPriceTier[];
};

function tierLabel(tier: { minQty: number; maxQty: number | null | undefined }) {
  return tier.maxQty == null ? `${tier.minQty}+` : `${tier.minQty}-${tier.maxQty}`;
}

export default function ProductPriceTiers({ priceTiers }: ProductPriceTiersProps) {
  if (!priceTiers || priceTiers.length === 0) return null;

  const sortedTiers = [...priceTiers].sort((a, b) => a.minQty - b.minQty);

  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Pricing Tiers</h2>
      <div className="space-y-3">
        {sortedTiers.map((tier, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg p-3 ${
              index === 0 ? "border-2 border-emerald-600 bg-emerald-50" : "border border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="size-5 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">
                {tierLabel({ minQty: tier.minQty, maxQty: tier.maxQty })} pcs
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">
                {formatProductPrice(tier.unitPrice)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}