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

  if (loading) return <div className="py-12 text-center text-slate-500">Loading featured items...</div>;

  return (
    <section className="container-shell py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-slate-900">Featured Products</h2>
        <Link
          href="/products"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-[#d98b2b] hover:text-white group"
        >
          View All
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