"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import WholesaleProductCard from "@/components/wholesale/WholesaleProductCard";
import ProductCarousel from "@/components/wholesale/ProductCarousel";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { wholesaleApi } from "@/services/wholesale.service";
import type { WholesaleProduct } from "@/types/wholesale";

export default function WholesaleProductsPage() {
  const { products, loading, loadingMore, error, hasMore, loadMore } = useInfiniteProducts({});

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Top Searched Items — separate from the main paginated grid below.
  const [topSearched, setTopSearched] = useState<WholesaleProduct[]>([]);
  const [topSearchedLoading, setTopSearchedLoading] = useState(true);

  useEffect(() => {
    wholesaleApi
      .getFrequentlySearchedProducts()
      .then((data) => {
        if (data.length > 0) {
          setTopSearched(data.slice(0, 10));
        } else {
          // Fallback per spec when frequently-searched has nothing yet
          return wholesaleApi.getRecommendations().then((rec) => setTopSearched(rec.slice(0, 10)));
        }
      })
      .catch(() => setTopSearched([]))
      .finally(() => setTopSearchedLoading(false));
  }, []);

  useEffect(() => {
    if (!sentinelRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, loadMore]);

  if (error && products.length === 0) {
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
        <div className="container-shell space-y-10">
          <h1 className="text-2xl font-black text-slate-950">Wholesale Products</h1>

          {/* Top Searched Items — hidden entirely while loading or empty,
              rather than showing a skeleton for a section that may not render. */}
          {!topSearchedLoading && topSearched.length > 0 && (
            <ProductCarousel title="Top Searched Items" products={topSearched} viewAllHref="/wholesale/products" />
          )}

          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <WholesaleProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="mt-6 flex justify-center">
                {loadingMore && (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
                )}
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="mt-8 text-center text-sm text-slate-400">You've reached the end.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}