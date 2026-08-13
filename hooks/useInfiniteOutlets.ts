"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type NearestOutlet = {
    outletId: number;
    name: string;
    latitude: number;
    longitude: number;
    distance: number;
    price: number;
    quantity: number;
    photo: string | null;
    deliveryConfig: {
        isDeliveryActive: boolean;
        baseDeliveryFee: number;
    } | null;
    operatingHours: string | null;
};

type UseInfiniteOutletsParams = {
    itemId: number | null;
    lat: number | undefined;
    lng: number | undefined;
    radiusKm: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useInfiniteOutlets({ itemId, lat, lng, radiusKm }: UseInfiniteOutletsParams) {
    const [outlets, setOutlets] = useState<NearestOutlet[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    // Cursor for the *next* fetch — the last outlet's distance from the
    // most recently loaded page. null means "start from the beginning."
    const cursorRef = useRef<string | null>(null);
    // Guards against duplicate in-flight requests (e.g. the observer
    // firing again before the previous fetch resolves).
    const fetchingRef = useRef(false);

    const buildParams = useCallback(
        (cursor: string | null) => {
            if (itemId === null || lat === undefined || lng === undefined) return null;
            const params = new URLSearchParams({
                itemId: String(itemId),
                lat: String(lat),
                lng: String(lng),
                radiusKm: String(radiusKm),
            });
            if (cursor) params.set("cursor", cursor);
            return params;
        },
        [itemId, lat, lng, radiusKm]
    );

    // Fresh search — resets everything and loads the first page.
    const reset = useCallback(async () => {
        const params = buildParams(null);
        if (!params) {
            setOutlets([]);
            setHasMore(false);
            return;
        }

        cursorRef.current = null;
        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/outlets/nearest?${params.toString()}`, {
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to fetch nearby outlets.");
            }
            setOutlets(data.outlets);
            setHasMore(data.hasMore);
            cursorRef.current = data.nextCursor;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
            setOutlets([]);
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
        const params = buildParams(cursorRef.current);
        if (!params) return;

        fetchingRef.current = true;
        setLoadingMore(true);

        try {
            const res = await fetch(`${API_URL}/outlets/nearest?${params.toString()}`, {
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to fetch more outlets.");
            }
            // Append, not replace — this is the key difference from reset().
            setOutlets((prev) => [...prev, ...data.outlets]);
            setHasMore(data.hasMore);
            cursorRef.current = data.nextCursor;
        } catch (err) {
            // A failed "load more" shouldn't wipe out what's already
            // shown — just surface the error and let the user retry
            // by scrolling again.
            setError(err instanceof Error ? err.message : "Failed to load more outlets.");
        } finally {
            setLoadingMore(false);
            fetchingRef.current = false;
        }
    }, [buildParams, hasMore]);

    // Re-run the search whenever the query itself changes (new item,
    // new coords, new radius) — but NOT when just paginating.
    useEffect(() => {
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId, lat, lng, radiusKm]);

    return {
        outlets,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
    };
}