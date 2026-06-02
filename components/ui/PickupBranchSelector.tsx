"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Clock, Calendar } from "lucide-react";
import type { ApiOutlet } from "@/types/api-outlet";


type CheckoutCartItem = {
  id: number;
  product_id: number;
  branch_id: number | null;
};

// Safely load the Map component only on the client side to avoid SSR errors
const StoreMap = dynamic(() => import("@/components/ui/Map"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-56 w-full space-y-2 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#3a9688]" />
      <p className="text-sm font-medium">Loading Map...</p>
    </div>
  )
});

interface PickupBranchSelectorProps {
  onSelect: (store: ApiOutlet) => void;
  selectedStore: ApiOutlet | null;
  cartItems: CheckoutCartItem[];
}

export default function PickupBranchSelector({
  onSelect,
  selectedStore,
  cartItems,
}: PickupBranchSelectorProps) {
  const [stores, setStores] = useState<ApiOutlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchStores = async () => {
      try {
        const res = await fetch(`${API_URL}/outlets/`);
        if (!res.ok) {
          throw new Error("Failed to fetch outlets");
        }
        const data = await res.json();
        const branchIds = [
          ...new Set(
            cartItems
              .map((item) => item.branch_id)
              .filter(Boolean)
          ),
        ];

        const filteredStores = data.filter((store: ApiOutlet) =>
          branchIds.includes(store.id)
        );

        setStores(filteredStores);
      } catch (error) {
        console.error("Error fetching outlets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Branch Selection List */}
      {!selectedStore && (
        <>
          <h3 className="text-xl font-serif font-bold text-brand-blue">
            Select Pickup Store
          </h3>

          <div className="grid gap-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading pickup stores...</p>
            ) : stores.length === 0 ? (
              <p className="text-sm text-slate-500">No pickup stores available.</p>
            ) : (
              stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => onSelect(store)}
                  className="group flex w-full cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 text-left transition-all hover:border-[#3a9688] hover:bg-[#f8faf9]"
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 group-hover:border-[#3a9688]">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#3a9688] opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-brand-blue">{store.name}</p>
                      <p className="text-sm font-medium text-slate-400">
                        {store.address || store.branch_address || "No address available"}
                      </p>
                      <p className="text-sm font-bold text-[#3a9688]">
                        8:00 AM - 9:00 PM
                      </p>
                    </div>
                  </div>

                  <MapPin className="h-5 w-5 text-[#3a9688] opacity-80" />
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* 2. Interactive Map Section */}
      <div className="w-full">
        {selectedStore && selectedStore.latitude && selectedStore.longitude ? (
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-1 shadow-sm transition-all hover:shadow-md">
            {/* Coordinate Badge Overlay */}
            <div className="absolute bottom-4 left-1/2 z-1000 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm backdrop-blur-sm border border-slate-100">
              Lat: {parseFloat(selectedStore.latitude).toFixed(4)}, Lng: {parseFloat(selectedStore.longitude).toFixed(4)}
            </div>

            <div className="h-64 w-full rounded-xl overflow-hidden">
              <StoreMap 
                lat={parseFloat(selectedStore.latitude)} 
                lng={parseFloat(selectedStore.longitude)} 
                label={selectedStore.name} 
              />
            </div>
          </div>
        ) : (
          <div className="relative flex h-56 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center">
            <MapPin className="mb-3 h-8 w-8 text-[#3a9688] opacity-40" />
            <p className="font-serif text-sm font-bold text-slate-400">
              {selectedStore 
                ? `Coordinates unavailable for ${selectedStore.name}` 
                : "Select a pickup store to view map"}
            </p>
            <p className="mt-1 text-[10px] text-slate-400 uppercase tracking-widest">
              Live location tracking
            </p>
          </div>
        )}
      </div>

      {/* 3. Pickup Scheduling Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Calendar className="h-3 w-3" /> Pickup Date
          </label>
          <input
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#3a9688] focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Clock className="h-3 w-3" /> Pickup Time
          </label>
          <input
            type="time"
            className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#3a9688] focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}