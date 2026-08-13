"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Header from "@/components/layout/Header";
import WholesaleHero from "@/components/wholesale/WholesaleHero";
import QuickActionStrip from "@/components/wholesale/QuickActionStrip";
import CategorySidebar from "@/components/wholesale/CategorySidebar";
import RecommendationCard from "@/components/wholesale/RecommendationCard";
import PromotionBanner from "@/components/wholesale/PromotionBanner";
import WholesaleFooter from "@/components/wholesale/WholesaleFooter";
import { wholesaleApi } from "@/services/wholesale.service";
import { getRecentlyViewedIds } from "@/lib/recentlyViewed";
import type { WholesaleBanner, WholesaleCategory, WholesaleProduct } from "@/types/wholesale";
import { useAuth } from "@/hooks/useAuth";
import { logDev } from "@/lib/logDev";

const WholesaleBelowFold = dynamic(() => import("@/components/wholesale/WholesaleBelowFold"), { loading: () => <div className="container-shell py-10"><div className="h-72 animate-pulse rounded-xl bg-slate-200" /></div> });

function LoadingCards() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-xl bg-slate-200" />)}</div>;
}

function LoadingRecommendations() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="h-64 animate-pulse rounded-xl bg-slate-200" />
    ))}
  </div>;
}

export default function WholesaleMarketplace() {
  const { isAuthenticated, user } = useAuth()
  const [recentlyViewed, setRecentlyViewed] = useState<WholesaleProduct[]>([]);
  const [frequentlySearched, setFrequentlySearched] = useState<WholesaleProduct[]>([]);

  const [categories, setCategories] = useState<WholesaleCategory[]>([]);
  const [recommendations, setRecommendations] = useState<WholesaleProduct[]>([]);
  const [banners, setBanners] = useState<WholesaleBanner[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const viewedIds = getRecentlyViewedIds();
    logDev("check authenticated: ", isAuthenticated)
    logDev("Check user data: ", user)
    Promise.all([
      wholesaleApi.getCategories().catch(() => [] as WholesaleCategory[]),
      wholesaleApi.getRecommendations().catch(() => [] as WholesaleProduct[]),
      wholesaleApi.getBanners(),
      wholesaleApi.getProductsByIds(viewedIds).catch(() => [] as WholesaleProduct[]),
      wholesaleApi.getFrequentlySearchedProducts().catch(() => [] as WholesaleProduct[]),
    ])
      .then(([categoryData, productData, bannerData, viewedData, frequentData]) => {
        setCategories(categoryData);
        setRecommendations(productData);
        setBanners(bannerData);
        setRecentlyViewed(viewedData);
        setFrequentlySearched(frequentData);
      })
      .catch((err) => {
        setApiError(err?.message ?? "Failed to load wholesale marketplace data.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);


  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header wholesale />
      <WholesaleHero />
      <QuickActionStrip />

      {apiError && (
        <div className="container-shell py-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        </div>
      )}

      {/* Mobile drawer overlay */}
      {isDrawerOpen && (
        <>
          <button
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close category menu"
            className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden"
          />
          <CategorySidebar categories={categories} drawer onClose={() => setIsDrawerOpen(false)} />
        </>
      )}

      {/* Main content area - Alibaba style layout */}
      <section className="container-shell py-8">
        {/* Mobile: Browse categories button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-emerald-900 lg:hidden"
        >
          <Menu className="size-4" />
          Browse categories
        </button>

        {/* Desktop: 3-column grid (left sidebar, center content, right banner) */}
        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
          {/* Left: Category sidebar (desktop only) */}
          <CategorySidebar categories={categories} />

          {/* Center: Recommendation sections */}
          {isLoading ? (
            <LoadingRecommendations />
          ) : recommendations.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <RecommendationCard products={recommendations} title="Browsing history" />
              <RecommendationCard products={recentlyViewed} title="Continue looking" />
              <RecommendationCard products={frequentlySearched} title="Frequently searched" />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No recommendations available at this time.</div>
          )}

          {/* Right: Promotional banner */}
          {banners[0] ? (
            <PromotionBanner banner={banners[0]} />
          ) : (
            <div className="h-[270px] animate-pulse rounded-xl bg-slate-200" />
          )}
        </div>
      </section>

      <WholesaleBelowFold />
      <WholesaleFooter />
    </main>
  );
}
