"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { wholesaleApi } from "@/services/wholesale.service";
import type { WholesaleProduct } from "@/types/wholesale";

const PAGE_SIZE = 20;

type UseInfiniteProductsParams = {
  search?: string;
  category?: string;
};

export function useInfiniteProducts({ search, category }: UseInfiniteProductsParams) {
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Tracks how many items we've already loaded — doubles as the next offset.
  const offsetRef = useRef(0);
  // Guards against duplicate in-flight requests (e.g. the observer
  // firing again before the previous fetch resolves).
  const fetchingRef = useRef(false);
  // Dedupe safety net — the BE's id:asc tiebreaker should already
  // prevent this, but a stable Set costs nothing and protects against
  // any future ordering regression.
  const seenIdsRef = useRef<Set<string>>(new Set());

  const buildParams = useCallback(
    (offset: number) => {
      const params: Record<string, string> = {
        limit: String(PAGE_SIZE),
        offset: String(offset),
      };
      if (search?.trim()) params.search = search.trim();
      if (category) params.category = category;
      return params;
    },
    [search, category]
  );

  // Fresh search — resets everything and loads the first page.
  // Fires whenever search/category change, per the spec's
  // "reset pagination to page 1" requirement.
  const reset = useCallback(async () => {
    offsetRef.current = 0;
    seenIdsRef.current = new Set();
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await wholesaleApi.getProductsPaginated(buildParams(0));
      res.data.forEach((p) => seenIdsRef.current.add(p.id));
      setProducts(res.data);
      setHasMore(res.hasMore);
      offsetRef.current = res.data.length;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
      setProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [buildParams]);

  // Appends the next page. Safe to call repeatedly — no-ops if a fetch
  // is already in flight or there's nothing left to load.
  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoadingMore(true);

    try {
      const res = await wholesaleApi.getProductsPaginated(buildParams(offsetRef.current));
      // Dedupe defensively even though the BE orders deterministically —
      // guards against a stale/duplicate fetch slipping through.
      const fresh = res.data.filter((p) => !seenIdsRef.current.has(p.id));
      fresh.forEach((p) => seenIdsRef.current.add(p.id));

      setProducts((prev) => [...prev, ...fresh]);
      setHasMore(res.hasMore);
      offsetRef.current += res.data.length;
    } catch (err) {
      // A failed "load more" shouldn't wipe out what's already
      // shown — just surface the error and let the user retry
      // by scrolling again.
      setError(err instanceof Error ? err.message : "Failed to load more products.");
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [buildParams, hasMore]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  };
}