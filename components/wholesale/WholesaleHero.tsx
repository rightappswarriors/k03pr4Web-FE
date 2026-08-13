"use client";

import { Handshake } from "lucide-react";
import { WholesaleSearch } from "./WholesaleSearch";

export default function WholesaleHero() {
  const popularKeywords = ["Cement", "Rice", "Solar panels", "Packaging"];

  return (
    <section className="bg-[radial-gradient(circle_at_88%_20%,#d8f3e8,transparent_26rem),linear-gradient(120deg,#f7f4ed,#fff)]">
      <div className="container-shell grid min-h-[280px] items-center gap-8 py-10 lg:grid-cols-[.85fr_1.15fr] lg:py-14">
        {/* Left: Hero text */}
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
            <Handshake className="size-4" aria-hidden="true" />
            Kompra Wholesale Marketplace
          </p>
          <h1 className="max-w-xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Source quality products from{" "}
            <span className="text-emerald-800">verified suppliers.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Better wholesale prices, bulk discounts and reliable delivery for growing Philippine businesses.
          </p>
        </div>

        {/* Right: Search area */}
        <div>
          <WholesaleSearch />
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Popular:</span>
            {popularKeywords.map((item) => (
              <button
                type="button"
                className="underline decoration-slate-300 underline-offset-4 hover:text-emerald-800 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}