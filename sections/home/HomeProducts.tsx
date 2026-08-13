"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductGrid from "@/components/ui/ProductGrid";
import type { ApiProduct } from "@/types/api-product";

export default function HomeProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const loadHomeProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        // Set products and limit to 4 for the home display
        setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (err) {
        console.error("HOME_PRODUCTS_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeProducts();
  }, [API_URL]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[#ded8cc] bg-white p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">Loading featured items...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
            Products
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#10231f] sm:text-3xl">
            Featured products
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#66706b]">
            Popular items with clear pricing, stock, and quick cart access.
          </p>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-sm font-bold text-[#1f5f56] transition hover:text-[#f97316]"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {products.length > 0 ? (
        <ProductGrid items={products} />
      ) : (
        <p className="text-slate-500">No products available at the moment.</p>
      )}
    </section>
  );
}
