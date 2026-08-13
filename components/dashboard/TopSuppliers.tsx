"use client";

import { Star } from "lucide-react";

interface TopSupplier {
  id: string;
  name: string;
  rating: number;
  city: string;
  status: string;
}

interface TopSuppliersProps {
  suppliers: TopSupplier[];
}

export default function TopSuppliers({ suppliers }: TopSuppliersProps) {
  if (suppliers.length === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900">Top Suppliers</h2>
      <div className="mt-4 flow-root">
        <ul className="divide-y divide-slate-100">
          {suppliers.map((supplier) => (
            <li key={supplier.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f4f1]">
                  <span className="text-xs font-bold text-[#2f8f83]">
                    {supplier.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{supplier.name}</p>
                  <p className="text-xs text-slate-400">{supplier.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="text-xs font-semibold text-slate-600">
                    {supplier.rating}
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#e6f4f1] px-2 py-0.5 text-[10px] font-bold text-[#2f8f83]">
                  Active
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
