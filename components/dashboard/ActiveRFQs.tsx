"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { RecentRfq } from "@/types/dashboard";

interface ActiveRFQsProps {
  rfqs: RecentRfq[];
}

export default function ActiveRFQs({ rfqs }: ActiveRFQsProps) {
  if (rfqs.length === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900">My Active RFQs</h2>
      <div className="mt-4 flow-root">
        <ul className="divide-y divide-slate-100">
          {rfqs.map((rfq) => (
            <li key={rfq.id}>
              <Link
                href={`/wholesale/rfqs/${rfq.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-[#2f8f83]">
                    {rfq.rfqNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4e5] px-2 py-0.5 text-xs font-medium text-[#b45200]">
                    {rfq.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {rfq.supplierCount && (
                    <span>{rfq.supplierCount} supplier{rfq.supplierCount > 1 ? "s" : ""} responding</span>
                  )}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
