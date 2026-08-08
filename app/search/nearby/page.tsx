"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/SearchBar";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { SearchSuggestion } from "@/hooks/useSearch";
import { MapPin, Store } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full w-full space-y-2 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#3a9688]" />
            <p className="text-sm font-medium">Loading Map...</p>
        </div>
    ),
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
const UNLIMITED_RADIUS_KM = 500; // effectively "no limit" for local outlet data

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchNearbyPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || undefined;

    const { coords } = useGeolocation();
    const [selectedItem, setSelectedItem] = useState<SearchSuggestion | null>(null);
    const [maxDistanceEnabled, setMaxDistanceEnabled] = useState(true);
    const [outlets, setOutlets] = useState<NearestOutlet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            const res = await fetch(`${API_URL}/outlets/nearest?${params.toString()}`, {
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to fetch nearby outlets.");
            }
            setOutlets(data.outlets);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
            setOutlets([]);
        } finally {
            setLoading(false);
        }
    }, [selectedItem, coords, radiusKm]);

    useEffect(() => {
        fetchOutlets();
    }, [fetchOutlets]);

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
                            onSelectItem={(item) => setSelectedItem(item)}
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
                    <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
                        <div className="h-[500px] rounded-3xl overflow-hidden shadow-sm">
                            <MapView />
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
                                {outlets.map((outlet) => (
                                    <li
                                        key={outlet.outletId}
                                        className="rounded-2xl border border-slate-200 p-4"
                                    >
                                        <p className="font-semibold text-slate-900">{outlet.name}</p>
                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                            <MapPin size={12} />
                                            {outlet.distance.toFixed(1)} km away
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">
                                            ₱{outlet.price.toFixed(2)} · {outlet.quantity} in stock
                                        </p>
                                        {outlet.operatingHours && (
                                            <p className="mt-1 text-xs text-slate-400">{outlet.operatingHours}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}