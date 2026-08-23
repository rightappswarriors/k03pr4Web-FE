"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import WholesaleProductCard from "./WholesaleProductCard";
import type { WholesaleProduct } from "@/types/wholesale";

export default function ProductCarousel({ title, products, viewAllHref = "/products" }: { title: string; products: WholesaleProduct[]; viewAllHref?: string }) {
  if (products.length === 0) return null;

  return (
    <section id="recommended-products">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">Direct from businesses ready to fulfill your order.</p>
        </div>
        <Link
          href={viewAllHref}
          className="hidden text-sm font-bold text-emerald-800 sm:inline-flex hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
        >
          View all products <ArrowRight className="ml-1 size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Single item: plain card, no scroll container per spec.
          Multiple items: horizontal scroll carousel, unchanged. */}
      {products.length === 1 ? (
        <div className="flex">
          <WholesaleProductCard product={products[0]} />
        </div>
      ) : (
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none]" role="region" aria-label={`${title} products`}>
          {products.map((product) => (
            <WholesaleProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}