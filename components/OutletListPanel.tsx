// components/OutletListPanel.tsx
"use client";

import { useEffect, useRef } from "react";
import { MapPin, Store, Clock } from "lucide-react";
import type { NearestOutlet } from "@/hooks/useInfiniteOutlets";

type OutletListPanelProps = {
    outlets: NearestOutlet[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    onLoadMore: () => void;
    activeOutletId: number | null;
    hoveredOutletId: number | null;
    onCardClick: (outletId: number) => void;
    onCardHover: (outletId: number | null) => void;
    cardRefs: React.MutableRefObject<Record<number, HTMLLIElement | null>>;
};

function OutletCardSkeleton() {
    return (
        <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-slate-200" />
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-slate-200" />
            <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
            </div>
        </div>
    );
}

export default function OutletListPanel({
    outlets,
    loading,
    loadingMore,
    error,
    hasMore,
    onLoadMore,
    activeOutletId,
    hoveredOutletId,
    onCardClick,
    onCardHover,
    cardRefs,
}: OutletListPanelProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            {
                rootMargin: "150px",
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [onLoadMore]);

    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-[#2f8f83]" />
                <h2 className="text-lg font-semibold text-slate-900">
                    {loading ? "Searching..." : `${outlets.length} outlet${outlets.length === 1 ? "" : "s"} found`}
                </h2>
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {loading && (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <OutletCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {!loading && !error && outlets.length === 0 && (
                <p className="text-sm text-slate-400">
                    No outlets found nearby with this item in stock.
                </p>
            )}

            {!loading && outlets.length > 0 && (
                <ul className="space-y-3">
                    {outlets.map((outlet, index) => {
                        const isActive = outlet.outletId === activeOutletId;
                        const isHovered = outlet.outletId === hoveredOutletId;

                        return (
                            <li
                                key={outlet.outletId}
                                ref={(el) => {
                                    cardRefs.current[outlet.outletId] = el;
                                }}
                                onClick={() => onCardClick(outlet.outletId)}
                                onMouseEnter={() => onCardHover(outlet.outletId)}
                                onMouseLeave={() => onCardHover(null)}
                                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                                    isActive
                                        ? "border-[#1f6b5f] bg-[#2f8f83]/10 ring-2 ring-[#2f8f83]/40"
                                        : isHovered
                                        ? "border-[#4fb3a3] bg-[#4fb3a3]/5"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <div
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                                        isActive ? "bg-[#1f6b5f]" : "bg-[#2f8f83]"
                                    }`}
                                >
                                    {index + 1}
                                </div>

                                {outlet.photo && (
                                    <img
                                        src={outlet.photo}
                                        alt={outlet.name}
                                        loading="lazy"
                                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                                    />
                                )}

                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-900">{outlet.name}</p>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin size={12} />
                                        {outlet.distance.toFixed(1)} km away
                                    </p>
                                    <p className="mt-1 text-sm text-slate-700">
                                        ₱{outlet.price.toFixed(2)} · {outlet.quantity} in stock
                                    </p>
                                    {outlet.operatingHours && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                            <Clock size={12} />
                                            {outlet.operatingHours}
                                        </p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {loadingMore && (
                <div className="mt-3 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <OutletCardSkeleton key={`more-${i}`} />
                    ))}
                </div>
            )}

            {hasMore && !loading && <div ref={sentinelRef} className="h-1" />}

            {!loading && !hasMore && outlets.length > 0 && (
                <p className="mt-4 text-center text-xs text-slate-400">No more results</p>
            )}
        </>
    );
}