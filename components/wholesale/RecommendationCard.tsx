"use client";

import Link from "next/link";
import type { WholesaleProduct } from "@/types/wholesale";

export default function RecommendationCard({ products, title }: { products: WholesaleProduct[]; title?: string }) {
  return (
    <article className="card overflow-hidden">
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">{title}</h3>
          <Link href="/products" className="text-xs font-semibold text-emerald-800 hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="flex gap-3">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {product.price} / {product.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}