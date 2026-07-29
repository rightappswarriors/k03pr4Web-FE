//k03pr4Web-FE\app\wholesale\products\page.tsx
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import WholesaleProductCard from "@/components/wholesale/WholesaleProductCard";
import { wholesaleApi } from "@/services/wholesale.service";
import type { WholesaleProduct } from "@/types/wholesale";

export default function WholesaleProductsPage() {
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    wholesaleApi
      .getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <>
        <Header wholesale />
        <main className="min-h-screen bg-[#f7f7f5] py-8">
          <div className="container-shell text-center text-red-600">
            Failed to load products. Please check your connection and try again.
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header wholesale />
        <main className="min-h-screen bg-[#f7f7f5] py-8">
          <div className="container-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header wholesale />
      <main className="min-h-screen bg-[#f7f7f5] py-8">
        <div className="container-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <WholesaleProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </>
  );
}