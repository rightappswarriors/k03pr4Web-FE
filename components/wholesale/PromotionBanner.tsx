"use client";

import Link from "next/link";
import type { WholesaleBanner } from "@/types/wholesale";

export default function PromotionBanner({ banner }: { banner: WholesaleBanner }) {
  return (
    <article
      id="deals"
      className="relative min-h-[270px] overflow-hidden rounded-xl bg-emerald-950 p-6 text-white"
    >
      <img
        src={banner.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
      />
      <div className="relative max-w-[13rem]">
        <span className="inline-flex rounded-full bg-orange-400/20 px-2 py-1 text-xs font-bold text-orange-200">
          {banner.eyebrow}
        </span>
        <h2 className="mt-5 text-2xl font-black leading-tight">{banner.title}</h2>
        <p className="mt-3 text-sm leading-5 text-emerald-50">{banner.copy}</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-50 focus:outline-2 focus:outline-offset-2 focus:outline-white"
        >
          View deals
        </Link>
      </div>
      <div className="absolute bottom-4 left-6 flex gap-2" aria-label="Banner navigation">
        <i className="size-2 rounded-full bg-white" aria-hidden="true" />
        <i className="size-2 rounded-full bg-white/50" aria-hidden="true" />
        <i className="size-2 rounded-full bg-white/50" aria-hidden="true" />
      </div>
    </article>
  );
}