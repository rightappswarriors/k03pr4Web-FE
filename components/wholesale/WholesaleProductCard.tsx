"use client";

import { memo } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, Timer } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";

export function MOQBadge({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-slate-500">MOQ: {children}</span>;
}

export function SupplierBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      Verified
    </span>
  );
}

export function LeadTimeBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Timer className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

const WholesaleProductCard = memo(function WholesaleProductCard({ product }: { product: WholesaleProduct }) {
  return (
    <article className="w-60 shrink-0 snap-start rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-700">
      <Link href={`/wholesale/products/${product.id}`} className="focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-36 w-full rounded-lg object-cover"
        />
      </Link>
      <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-bold text-slate-900">{product.name}</h3>
      <p className="mt-1 text-base font-black text-slate-950">
        {product.price} <span className="text-xs font-normal text-slate-500">/ {product.unit}</span>
      </p>
      <MOQBadge>{product.moq}</MOQBadge>
      <div className="mt-3 flex items-center justify-between">
        <SupplierBadge />
        <LeadTimeBadge>{product.leadTime}</LeadTimeBadge>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
        <MapPin className="size-3" aria-hidden="true" />
        {product.location}
      </p>
    </article>
  );
});

export default WholesaleProductCard;