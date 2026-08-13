"use client";

import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import type { RecentRfq } from "@/types/dashboard";

interface RecentRFQsProps {
  rfqs: RecentRfq[];
}

export default function RecentRFQs({ rfqs }: RecentRFQsProps) {
  if (rfqs.length === 0) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900">My Active RFQs</h2>
        <div className="mt-4 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-6 w-6 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-slate-500">No quotations yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Browse wholesale products and send your first RFQ.
          </p>
          <div className="mt-4">
            <Link
              href="/wholesale/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea580c]"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{rfq.product}</span>
                  <span className="text-xs text-slate-500">{rfq.supplier}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {rfq.status}
                  </span>
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
