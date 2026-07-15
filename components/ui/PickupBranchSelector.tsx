"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Clock, Calendar, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

const StoreMap = dynamic(() => import("@/components/ui/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-56 w-full space-y-2 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#3a9688]" />
      <p className="text-sm font-medium">Loading Map...</p>
    </div>
  ),
});

type CheckoutCartItem = {
  id: number;
  product_id: number;
  branch_id: number | null;
  product_name: string;
  image: string | null;
  outlet_name: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

type OutletOption = {
  outlet_id: number;
  outlet_name: string;
  outlet_address: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  in_stock: boolean;
  available_quantity: number;
  inventory_item_id: number;
  price: number;
};

interface PickupBranchSelectorProps {
  cartItems: CheckoutCartItem[];
  onCartUpdate: () => void; // tells the parent checkout page to refetch the cart
}

export default function PickupBranchSelector({ cartItems, onCartUpdate }: PickupBranchSelectorProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [outletOptions, setOutletOptions] = useState<Record<number, OutletOption[]>>({});
  const [loadingOutlets, setLoadingOutlets] = useState<Record<number, boolean>>({});
  const [switching, setSwitching] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<Record<string, { date: string; time: string }>>({});

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("access") : null);

  // Group cart items by their current outlet (branch_id here is actually an Outlet.id — see backend notes)
  const groups = cartItems.reduce<Record<string, CheckoutCartItem[]>>((acc, item) => {
    const key = String(item.branch_id ?? "unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const toggleChangeOutlet = async (itemId: number) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
      return;
    }
    setExpandedItemId(itemId);
    if (outletOptions[itemId]) return; // already loaded

    setLoadingOutlets((prev) => ({ ...prev, [itemId]: true }));
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/cart/item/${itemId}/outlets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load outlet options.");
      const data = await res.json();
      setOutletOptions((prev) => ({ ...prev, [itemId]: data.outlets }));
    } catch (error) {
      console.error("Error loading outlet options:", error);
    } finally {
      setLoadingOutlets((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleSwitchOutlet = async (itemId: number, outletId: number) => {
    setSwitching(itemId);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/cart/item/${itemId}/outlet`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ outlet_id: outletId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to switch outlet.");
      }
      setExpandedItemId(null);
      setOutletOptions((prev) => {
        const next = { ...prev };
        delete next[itemId]; // force refetch next time, since stock may have shifted
        return next;
      });
      onCartUpdate(); // parent refetches the full cart, regrouping happens automatically
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to switch outlet.");
    } finally {
      setSwitching(null);
    }
  };

  const updateSchedule = (groupKey: string, field: "date" | "time", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [groupKey]: { ...prev[groupKey], [field]: value } as { date: string; time: string },
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-brand-blue">Pickup Details</h3>

      {Object.entries(groups).map(([groupKey, groupItems]) => {
        const first = groupItems[0];
        const groupSchedule = schedule[groupKey] || { date: new Date().toISOString().split("T")[0], time: "" };
        const groupOutletOption = groupItems
          .flatMap((item) => outletOptions[item.id] || [])
          .find((o) => o.outlet_id === first.branch_id);

        return (
          <div key={groupKey} className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
            {/* Outlet header for this group */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#3a9688]/10">
                  <MapPin className="h-4 w-4 text-[#3a9688]" />
                </div>
                <div>
                  <p className="font-bold text-brand-blue">{first.outlet_name || "Unassigned outlet"}</p>
                  <p className="text-xs font-medium text-slate-400">
                    {groupItems.length} item{groupItems.length > 1 ? "s" : ""} from this outlet
                  </p>
                </div>
              </div>
            </div>

            {/* Items within this outlet group, each with its own "Change outlet" control */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              {groupItems.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-brand-blue">
                      {item.product_name} <span className="text-slate-400">x{item.quantity}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleChangeOutlet(item.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#3a9688] hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {expandedItemId === item.id ? "Cancel" : "Change outlet"}
                    </button>
                  </div>

                  {expandedItemId === item.id && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                      {loadingOutlets[item.id] ? (
                        <p className="text-xs text-slate-500">Loading available outlets...</p>
                      ) : (outletOptions[item.id] || []).length === 0 ? (
                        <p className="text-xs text-slate-500">No other outlets carry this item.</p>
                      ) : (
                        (outletOptions[item.id] || []).map((option) => {
                          const disabled = !option.in_stock || !option.is_active || switching === item.id;
                          const isCurrent = option.outlet_id === item.branch_id;
                          return (
                            <button
                              key={option.outlet_id}
                              type="button"
                              disabled={disabled || isCurrent}
                              onClick={() => handleSwitchOutlet(item.id, option.outlet_id)}
                              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                                isCurrent
                                  ? "border-[#3a9688] bg-[#f8faf9] cursor-default"
                                  : disabled
                                  ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                                  : "border-slate-100 bg-white hover:border-[#3a9688] cursor-pointer"
                              }`}
                            >
                              <div>
                                <p className="text-xs font-bold text-brand-blue">{option.outlet_name}</p>
                                <p className="text-[10px] text-slate-400">{option.outlet_address}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {isCurrent ? (
                                  <span className="text-[10px] font-bold text-[#3a9688]">Current</span>
                                ) : option.in_stock && option.is_active ? (
                                  <CheckCircle2 className="h-4 w-4 text-[#3a9688]" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-300" />
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Map for this group's current outlet */}
            {groupOutletOption?.latitude && groupOutletOption?.longitude && (
              <div className="h-48 w-full overflow-hidden rounded-xl border border-slate-100">
                <StoreMap
                  lat={groupOutletOption.latitude}
                  lng={groupOutletOption.longitude}
                  label={first.outlet_name || "Pickup location"}
                />
              </div>
            )}

            {/* Per-outlet pickup schedule */}
            <div className="grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Calendar className="h-3 w-3" /> Pickup Date
                </label>
                <input
                  type="date"
                  value={groupSchedule.date}
                  onChange={(e) => updateSchedule(groupKey, "date", e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#3a9688] focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Clock className="h-3 w-3" /> Pickup Time
                </label>
                <input
                  type="time"
                  value={groupSchedule.time}
                  onChange={(e) => updateSchedule(groupKey, "time", e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#3a9688] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}