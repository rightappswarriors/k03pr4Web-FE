"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/SearchBar";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { SearchSuggestion } from "@/hooks/useSearch";
import { MapPin, Store, Clock, ChevronUp } from "lucide-react";
import type { MapOutlet } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full w-full space-y-2 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#3a9688]" />
            <p className="text-sm font-medium">Loading Map...</p>
        </div>
    ),
});

const OutletDetailDrawer = dynamic(() => import("@/components/OutletDetailDrawer"), {
    ssr: false,
});

type NearestOutlet = {
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

const DEFAULT_RADIUS_KM = 10;
const UNLIMITED_RADIUS_KM = 500;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Bottom sheet snap heights, as a fraction of viewport height.
const SHEET_PEEK_HEIGHT = 140; // px, shows handle + count + partial first card
const SHEET_EXPANDED_RATIO = 0.75; // 75% of viewport height when expanded

export default function SearchNearbyPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || undefined;

    const { coords } = useGeolocation();
    const [selectedItem, setSelectedItem] = useState<SearchSuggestion | null>(null);
    const [maxDistanceEnabled, setMaxDistanceEnabled] = useState(true);
    const [outlets, setOutlets] = useState<NearestOutlet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [activeOutletId, setActiveOutletId] = useState<number | null>(null);
    const [hoveredOutletId, setHoveredOutletId] = useState<number | null>(null);

    // Drawer state: which outlet's detail is currently open. null = closed.
    const [drawerOutletId, setDrawerOutletId] = useState<number | null>(null);

    const [sheetExpanded, setSheetExpanded] = useState(false);
    const dragStartY = useRef<number | null>(null);
    const dragStartExpanded = useRef(false);

    const cardRefs = useRef<Record<number, HTMLLIElement | null>>({});

    const radiusKm = maxDistanceEnabled ? DEFAULT_RADIUS_KM : UNLIMITED_RADIUS_KM;

    const fetchOutlets = useCallback(async () => {
        if (!selectedItem || !coords) return;

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                itemId: String(selectedItem.item_id),
                lat: String(coords.lat),
                lng: String(coords.lng),
                radiusKm: String(radiusKm),
            });
            const url = `${API_URL}/outlets/nearest?${params.toString()}`;

            const res = await fetch(url, {
                cache: "no-store",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to fetch nearby outlets.");
            }
            setOutlets(data.outlets);
        } catch (err) {
            console.error("fetchOutlets error:", err);
            setError(err instanceof Error ? err.message : "Something went wrong.");
            setOutlets([]);
        } finally {
            setLoading(false);
        }
    }, [selectedItem, coords, radiusKm]);

    useEffect(() => {
        fetchOutlets();
    }, [fetchOutlets]);

    useEffect(() => {
        setSelectedItem(null);
        setOutlets([]);
        setActiveOutletId(null);
        setHoveredOutletId(null);
        setSheetExpanded(false);
        setDrawerOutletId(null);
    }, [initialQuery]);

    // Expand the sheet automatically once results load, on mobile —
    // gives immediate feedback that results are ready without requiring
    // the user to find and drag the handle themselves.
    useEffect(() => {
        if (outlets.length > 0) {
            setSheetExpanded(true);
        }
    }, [outlets.length]);

    // Pin clicked on the map -> highlight + scroll the matching card into
    // view, expand the mobile sheet, and open the detail drawer.
    const handlePinClick = useCallback((outletId: number) => {
        setActiveOutletId(outletId);
        setSheetExpanded(true);
        setDrawerOutletId(outletId);
        const cardEl = cardRefs.current[outletId];
        if (cardEl) {
            cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, []);

    // Card clicked in the list -> same active state as clicking its pin,
    // and opens the same drawer.
    const handleCardClick = useCallback((outletId: number) => {
        setActiveOutletId(outletId);
        setDrawerOutletId(outletId);
    }, []);

    // Drag handlers for the mobile bottom sheet handle.
    const handleDragStart = useCallback((clientY: number) => {
        dragStartY.current = clientY;
        dragStartExpanded.current = sheetExpanded;
    }, [sheetExpanded]);

    const handleDragEnd = useCallback((clientY: number) => {
        if (dragStartY.current === null) return;
        const delta = dragStartY.current - clientY;
        // Dragged up more than 50px -> expand. Dragged down more than
        // 50px -> collapse. Otherwise treat as a tap, toggle state.
        if (delta > 50) {
            setSheetExpanded(true);
        } else if (delta < -50) {
            setSheetExpanded(false);
        } else {
            setSheetExpanded((prev) => !prev);
        }
        dragStartY.current = null;
    }, []);

    const mapOutlets: MapOutlet[] = outlets.map((o) => ({
        outletId: o.outletId,
        name: o.name,
        latitude: o.latitude,
        longitude: o.longitude,
        price: o.price,
        distance: o.distance,
    }));

    const outletListContent = (
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

            {!loading && !error && outlets.length === 0 && (
                <p className="text-sm text-slate-400">
                    No outlets found nearby with this item in stock.
                </p>
            )}

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
                            onClick={() => handleCardClick(outlet.outletId)}
                            onMouseEnter={() => setHoveredOutletId(outlet.outletId)}
                            onMouseLeave={() => setHoveredOutletId(null)}
                            className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${isActive
                                ? "border-[#1f6b5f] bg-[#2f8f83]/10 ring-2 ring-[#2f8f83]/40"
                                : isHovered
                                    ? "border-[#4fb3a3] bg-[#4fb3a3]/5"
                                    : "border-slate-200 hover:bg-slate-50"
                                }`}
                        >
                            <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isActive ? "bg-[#1f6b5f]" : "bg-[#2f8f83]"
                                    }`}
                            >
                                {index + 1}
                            </div>

                            {outlet.photo && (
                                <img
                                    src={outlet.photo}
                                    alt={outlet.name}
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
        </>
    );

    return (
        <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
            <Header />

            <section className="flex-1 container-shell py-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                    <h1 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">
                        Find Nearby Outlets
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Search for an item to see which nearby outlets have it in stock.
                    </p>

                    <div className="mt-5">
                        <SearchBar
                            placeholder="Search for an item..."
                            variant="light"
                            initialQuery={initialQuery}
                            showNearbyLink={false}
                            onSelectItem={(item) => {
                                setSelectedItem(item);
                                setActiveOutletId(null);
                            }}
                        />
                    </div>

                    {selectedItem && (
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">
                                Showing outlets for: <strong>{selectedItem.item_name}</strong>
                            </span>

                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <span>Max {DEFAULT_RADIUS_KM}km</span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={maxDistanceEnabled}
                                    onClick={() => setMaxDistanceEnabled((prev) => !prev)}
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${maxDistanceEnabled ? "bg-[#2f8f83]" : "bg-slate-300"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${maxDistanceEnabled ? "left-[22px]" : "left-0.5"
                                            }`}
                                    />
                                </button>
                            </label>
                        </div>
                    )}
                </div>

                {selectedItem && (
                    <>
                        {/* Desktop split view: 60% map / 40% list, side by side. */}
                        <div className="mt-6 hidden lg:grid gap-6 lg:grid-cols-[3fr_2fr]">
                            <div className="h-[600px] rounded-3xl overflow-hidden shadow-sm">
                                <MapView
                                    outlets={mapOutlets}
                                    activeOutletId={activeOutletId}
                                    onPinClick={handlePinClick}
                                    onPinHover={setHoveredOutletId}
                                />
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm max-h-[600px] overflow-y-auto">
                                {outletListContent}
                            </div>
                        </div>

                        {/* Mobile: full-screen map with a draggable bottom sheet
                            over it. Fixed positioning takes it out of normal
                            page flow so it behaves like a true overlay sheet. */}
                        <div className="lg:hidden mt-6 relative h-[calc(100vh-220px)] rounded-3xl overflow-hidden shadow-sm">
                            <MapView
                                outlets={mapOutlets}
                                activeOutletId={activeOutletId}
                                onPinClick={handlePinClick}
                                onPinHover={setHoveredOutletId}
                            />

                            <div
                                className="absolute left-0 right-0 bottom-0 z-20 rounded-t-3xl border border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-[height] duration-300 ease-out overflow-hidden"
                                style={{
                                    height: sheetExpanded
                                        ? `${SHEET_EXPANDED_RATIO * 100}%`
                                        : `${SHEET_PEEK_HEIGHT}px`,
                                }}
                            >
                                <div
                                    className="flex flex-col items-center py-3 cursor-grab active:cursor-grabbing touch-none"
                                    onPointerDown={(e) => handleDragStart(e.clientY)}
                                    onPointerUp={(e) => handleDragEnd(e.clientY)}
                                >
                                    <div className="h-1 w-10 rounded-full bg-slate-300" />
                                    <button
                                        type="button"
                                        onClick={() => setSheetExpanded((prev) => !prev)}
                                        className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500"
                                    >
                                        {loading
                                            ? "Searching..."
                                            : `${outlets.length} outlet${outlets.length === 1 ? "" : "s"} found`}
                                        <ChevronUp
                                            size={14}
                                            className={`transition-transform ${sheetExpanded ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                </div>

                                <div className="px-5 pb-6 overflow-y-auto h-full">
                                    {outletListContent}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <Footer />

            {/* Outlet detail drawer — opens when a pin or card is clicked */}
            <OutletDetailDrawer
                outletId={drawerOutletId}
                itemId={selectedItem?.item_id ?? null}
                onClose={() => setDrawerOutletId(null)}
            />
        </main>
    );
}