// components/OutletDetailDrawer.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Truck, Clock, ShoppingCart } from "lucide-react";
import { addToBackendCart } from "@/lib/cart-api";
import { useCart } from "@/store/useCart";

type OutletItemDetail = {
    outlet: {
        outletId: number;
        name: string;
        bio: string | null;
        bannerImage: string | null;
        operatingHours: string | null;
    };
    item: {
        itemId: number;
        inventoryItemId: number;
        name: string;
        description: string | null;
        price: number;
        quantity: number;
        photos: { url: string; type: string | null }[];
        units: {
            id: number;
            unitName: string;
            unitLabel: string;
            price: number;
            quantity: number;
            isDefault: boolean;
        }[];
    };
    deliveryConfig: {
        isDeliveryActive: boolean;
        baseDeliveryFee: number;
        feePerKm: number;
    } | null;
};

type OutletDetailDrawerProps = {
    outletId: number | null;
    itemId: number | null;
    onClose: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OutletDetailDrawer({ outletId, itemId, onClose }: OutletDetailDrawerProps) {
    const setCartCount = useCart((s) => s.setCount);

    const [detail, setDetail] = useState<OutletItemDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [photoIndex, setPhotoIndex] = useState(0);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const isOpen = outletId !== null && itemId !== null;

    useEffect(() => {
        if (!isOpen) return;

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            setPhotoIndex(0);
            setAddError(null);
            try {
                const res = await fetch(`${API_URL}/outlets/${outletId}/items/${itemId}`, {
                    cache: "no-store",
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load outlet details.");
                }
                setDetail(data);
                const defaultUnit = data.item.units.find((u: { isDefault: boolean }) => u.isDefault);
                setSelectedUnitId(defaultUnit?.id ?? data.item.units[0]?.id ?? null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong.");
                setDetail(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [isOpen, outletId, itemId]);

    // Lock body scroll while the drawer is open.
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleAddToCart = useCallback(async () => {
        if (!detail) return;

        setAddingToCart(true);
        setAddError(null);
        try {
            const result = await addToBackendCart(
                detail.item.inventoryItemId,
                1,
                detail.outlet.outletId
            );
            setCartCount(result.total_quantity);
            onClose();
        } catch (err) {
            setAddError(err instanceof Error ? err.message : "Failed to add to cart.");
        } finally {
            setAddingToCart(false);
        }
    }, [detail, setCartCount, onClose]);

    const nextPhoto = () => {
        if (!detail) return;
        setPhotoIndex((prev) => (prev + 1) % detail.item.photos.length);
    };

    const prevPhoto = () => {
        if (!detail) return;
        setPhotoIndex((prev) => (prev - 1 + detail.item.photos.length) % detail.item.photos.length);
    };

    if (!isOpen) return null;

    const selectedUnit = detail?.item.units.find((u) => u.id === selectedUnitId);
    const displayPrice = selectedUnit?.price ?? detail?.item.price;
    const displayUnitLabel = selectedUnit?.unitLabel;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer: slides from the right on desktop, bottom on mobile */}
            <div
                className="fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-out
                    inset-x-0 bottom-0 h-[85vh] rounded-t-3xl
                    md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[420px] md:rounded-t-none md:rounded-l-3xl
                    overflow-y-auto"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition"
                    aria-label="Close"
                >
                    <X size={18} className="text-slate-700" />
                </button>

                {loading && (
                    <div className="flex h-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#3a9688]" />
                    </div>
                )}

                {error && (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {detail && (
                    <div>
                        {/* Outlet banner */}
                        {detail.outlet.bannerImage && (
                            <img
                                src={detail.outlet.bannerImage}
                                alt={detail.outlet.name}
                                loading="lazy"
                                className="h-40 w-full object-cover"
                            />
                        )}

                        <div className="p-5">
                            {/* Outlet name + bio */}
                            <h2 className="text-lg font-bold text-slate-900">{detail.outlet.name}</h2>
                            {detail.outlet.bio && (
                                <p className="mt-1 text-sm text-slate-500">{detail.outlet.bio}</p>
                            )}
                            {detail.outlet.operatingHours && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                                    <Clock size={12} />
                                    {detail.outlet.operatingHours}
                                </p>
                            )}

                            <div className="my-4 border-t border-slate-100" />

                            {/* Item photo carousel */}
                            {detail.item.photos.length > 0 ? (
                                <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-slate-100">
                                    <img
                                        src={detail.item.photos[photoIndex].url}
                                        alt={detail.item.name}
                                        loading="lazy"
                                        className="h-full w-full object-cover"
                                    />
                                    {detail.item.photos.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={prevPhoto}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"
                                                aria-label="Previous photo"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextPhoto}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"
                                                aria-label="Next photo"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                                                {detail.item.photos.map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            i === photoIndex ? "bg-white" : "bg-white/50"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-4 flex aspect-square items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
                                    No photo available
                                </div>
                            )}

                            {/* Item info */}
                            <h3 className="text-xl font-bold text-slate-900">{detail.item.name}</h3>
                            {detail.item.description && (
                                <p className="mt-1 text-sm text-slate-600">{detail.item.description}</p>
                            )}

                            <p className="mt-3 text-2xl font-bold text-[#2f8f83]">
                                ₱{displayPrice?.toFixed(2)}
                                {displayUnitLabel && (
                                    <span className="text-sm font-normal text-slate-400"> / {displayUnitLabel}</span>
                                )}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {detail.item.quantity} in stock
                            </p>

                            {/* Unit selector */}
                            {detail.item.units.length > 1 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Unit
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {detail.item.units.map((unit) => (
                                            <button
                                                key={unit.id}
                                                type="button"
                                                onClick={() => setSelectedUnitId(unit.id)}
                                                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                                                    unit.id === selectedUnitId
                                                        ? "border-[#2f8f83] bg-[#2f8f83]/10 text-[#2f8f83]"
                                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                {unit.unitLabel}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Delivery availability indicator */}
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <Truck size={16} className={detail.deliveryConfig?.isDeliveryActive ? "text-[#2f8f83]" : "text-slate-400"} />
                                <span className="text-sm text-slate-700">
                                    {detail.deliveryConfig?.isDeliveryActive
                                        ? `Delivery available · ₱${detail.deliveryConfig.baseDeliveryFee.toFixed(0)} base fee`
                                        : "Delivery not available at this outlet"}
                                </span>
                            </div>

                            {addError && (
                                <p className="mt-3 text-sm text-red-600">{addError}</p>
                            )}

                            {/* Add to cart */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={addingToCart || detail.item.quantity === 0}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f8f83] py-3.5 text-sm font-semibold text-white transition hover:bg-[#26756b] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart size={18} />
                                {detail.item.quantity === 0
                                    ? "Out of stock"
                                    : addingToCart
                                        ? "Adding..."
                                        : "Add to Cart"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}