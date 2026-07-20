"use client";

import { Truck, ArrowRight } from "lucide-react";

export default function RFQCard() {
  return (
    <section className="rounded-xl bg-emerald-900 p-6 text-white sm:flex sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
          <Truck className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-black">Need a specific product?</h2>
          <p className="mt-1 text-sm text-emerald-50">
            Submit an RFQ and let qualified suppliers compete for your business.
          </p>
        </div>
      </div>
      <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-50 focus:outline-2 focus:outline-offset-2 focus:outline-white sm:mt-0">
        Submit RFQ <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </section>
  );
}