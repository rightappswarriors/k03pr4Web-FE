"use client";

import Link from "next/link";
import { Factory } from "lucide-react";
import { SupplierBadge } from "./WholesaleProductCard";
import type { WholesaleSupplier } from "@/types/wholesale";

export default function SupplierCard({ supplier }: { supplier: WholesaleSupplier }) {
  return (
    <article className="card p-5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-700">
      <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
        <Factory aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-bold">{supplier.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{supplier.specialty}</p>
      <div className="mt-4 flex items-center justify-between">
        <SupplierBadge />
        <span className="text-xs text-slate-500">
          {supplier.years} yrs &middot; {supplier.location}
        </span>
      </div>
    </article>
  );
}