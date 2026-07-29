"use client";

import { useEffect, useState } from "react";
import { wholesaleApi } from "@/services/wholesale.service";
import type { WholesaleProduct, WholesaleSupplier } from "@/types/wholesale";
import ProductCarousel from "./ProductCarousel";
import SupplierCard from "./SupplierCard";
import CategoryChip from "./CategoryChip";
import RFQCard from "./RFQCard";
import BecomeAgentBanner from "./BecomeAgentBanner";

const categoryFilters = ["All", "Construction", "Electronics", "Industrial", "Agriculture", "Food", "Packaging", "Health & Medical"];

function SectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-56 rounded bg-slate-200" />
      <div className="mt-4 flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-72 w-60 shrink-0 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export default function WholesaleBelowFold() {
  const [products, setProducts] = useState<WholesaleProduct[] | null>(null);
  const [suppliers, setSuppliers] = useState<WholesaleSupplier[] | null>(null);

  useEffect(() => {
    wholesaleApi
      .getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
    wholesaleApi
      .getSuppliers()
      .then(setSuppliers)
      .catch(() => setSuppliers([]));
  }, []);

  if (!products || !suppliers) {
    return (
      <section className="container-shell py-10">
        <SectionSkeleton />
      </section>
    );
  }

  return (
    <div className="container-shell space-y-10 py-10 sm:space-y-14">
      {/* Recommended Products Carousel */}
      <ProductCarousel title="Recommended products" products={products} />

      {/* Featured Suppliers Section */}
      <section id="suppliers" aria-labelledby="suppliers-heading">
        <div className="mb-4">
          <h2 id="suppliers-heading" className="text-xl font-black text-slate-950">
            Featured suppliers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Established partners serving businesses across the Philippines.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      </section>

      {/* Popular Products Section with Category Filters */}
      <section aria-labelledby="popular-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="popular-heading" className="text-xl font-black text-slate-950">
            Popular wholesale products
          </h2>
          <a href="/products" className="text-sm font-bold text-emerald-800 hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700">
            View all
          </a>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none]" role="group" aria-label="Product categories">
          {categoryFilters.map((category, index) => (
            <CategoryChip active={index === 0} key={category}>
              {category}
            </CategoryChip>
          ))}
        </div>
        <ProductCarousel title="" products={products.slice(2)} />
      </section>

      {/* RFQ and Agent CTA Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RFQCard />
        <BecomeAgentBanner />
      </div>
    </div>
  );
}
