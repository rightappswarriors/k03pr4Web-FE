"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, ShoppingCart, Plus, Minus, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { wholesaleApi } from "@/services/wholesale.service";
import OrderProtectionModal from "./OrderProtectionModal";
import type { WholesaleProduct } from "@/types/wholesale";

type PricingData = {
  supplierItem: {
    id: string;
    name: string;
    unitPrice: number;
    moq: number;
    availableQty: number;
    image?: string;
  };
  priceTiers: Array<{
    id: string;
    minQty: number;
    maxQty?: number | null;
    price: number;
    currency: string;
  }>;
  variantGroups: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      value: string;
      colorHex?: string;
      image?: string;
    }>;
  }>;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    availableQty: number;
    image?: string;
    isActive: boolean;
    optionIds: string[];
  }>;
};

type CartLine = {
  key: string;
  variantId: string | null;
  label: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

// Helper function for tier label - only last tier shows "+"
function tierLabel(tier: { minQty: number; maxQty: number | null | undefined }) {
  return tier.maxQty == null ? `${tier.minQty}+` : `${tier.minQty}-${tier.maxQty}`;
}

type AddToCartModalProps = {
  productId: string;
  product: WholesaleProduct;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AddToCartModal({
  productId,
  product,
  isOpen,
  onClose,
  onSuccess,
}: AddToCartModalProps) {
  const router = useRouter();
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [showProtection, setShowProtection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Track focus per line to avoid clobbering text input
  const lineFocusRef = useRef<Record<string, boolean>>({});

  // Guest cart helpers
  const getLocalCart = useCallback(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("wholesale_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const saveLocalCart = useCallback((items: any[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("wholesale_cart", JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("wholesale-cart-updated"));
    } catch {}
  }, []);

  // Fetch pricing data on open
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    wholesaleApi
      .getPricing(productId)
      .then((data) => {
        setPricing(data);
      })
      .catch(() => {
        setPricing({
          supplierItem: {
            id: productId,
            name: product.name,
            unitPrice: parseFloat(product.price || "0"),
            moq: parseInt(product.moq || "1"),
            availableQty: 999999,
            image: product.image,
          },
          priceTiers: [],
          variantGroups: [],
          variants: [],
        });
      })
      .finally(() => setLoading(false));
  }, [isOpen, productId, product]);

  // Compute bracket price for given quantity - client-side mirror
  const computeBracketPrice = useCallback((
    qty: number,
    priceTiers: PricingData["priceTiers"]
  ): number | null => {
    if (priceTiers.length === 0) return null;

    const sorted = [...priceTiers].sort((a, b) => a.minQty - b.minQty);
    for (const tier of sorted) {
      const minOk = qty >= tier.minQty;
      const maxOk = tier.maxQty === null || tier.maxQty === undefined ? true : qty <= tier.maxQty;
      if (minOk && maxOk) return tier.price;
    }

    // Use highest tier if quantity is above all ranges
    const highest = sorted[sorted.length - 1];
    if (highest && qty >= highest.minQty) return highest.price;
    return null;
  }, []);

  // Add a line for the selected option
  const handleAddLine = async (variantId: string | null) => {
    if (!pricing) return;

    const key = variantId === null ? `${pricing.supplierItem.id}::base` : variantId;

    // Check if line already exists
    const existingLine = lines.find(l => l.key === key);
    if (existingLine) return; // Already in cart, don't duplicate

    let newLine: CartLine;

    if (variantId === null) {
      // Base item - use tiered pricing
      const moq = pricing.supplierItem.moq;
      const unitPrice = computeBracketPrice(moq, pricing.priceTiers) || pricing.supplierItem.unitPrice;

      try {
        const quote = await wholesaleApi.priceQuote(pricing.supplierItem.id, { quantity: moq });
        newLine = {
          key,
          variantId: null,
          label: `Original / ${pricing.supplierItem.name}`,
          thumbnail: pricing.supplierItem.image,
          quantity: moq,
          unitPrice: quote.unitPrice,
          subtotal: quote.subtotal,
        };
      } catch {
        newLine = {
          key,
          variantId: null,
          label: `Original / ${pricing.supplierItem.name}`,
          thumbnail: pricing.supplierItem.image,
          quantity: moq,
          unitPrice,
          subtotal: unitPrice * moq,
        };
      }
    } else {
      // Variant - use flat price
      const variant = pricing.variants.find(v => v.id === variantId);
      if (!variant) return;

      newLine = {
        key,
        variantId,
        label: variant.name || variant.optionIds.join(" / "),
        thumbnail: variant.image,
        quantity: 1,
        unitPrice: variant.price,
        subtotal: variant.price,
      };
    }

    setLines(prev => [...prev, newLine]);
  };

  // Update line quantity
  const updateLineQuantity = (key: string, quantity: number, unitPrice: number) => {
    setLines(prev => prev.map(line =>
      line.key === key ? { ...line, quantity, unitPrice, subtotal: unitPrice * quantity } : line
    ));
  };

  // Remove a line
  const removeLine = (key: string) => {
    setLines(prev => prev.filter(l => l.key !== key));
  };

  // Handle quantity stepper change
  const handleQuantityChange = (key: string, delta: number) => {
    const line = lines.find(l => l.key === key);
    if (!line || !pricing) return;

    const moq = line.variantId === null ? pricing.supplierItem.moq : 1;
    const availableQty = line.variantId === null
      ? pricing.supplierItem.availableQty
      : pricing.variants.find(v => v.id === line.variantId)?.availableQty ?? 999999;

    const newQty = Math.max(moq, Math.min(availableQty, line.quantity + delta));
    updateLineQuantity(key, newQty, line.unitPrice);
  };

  // Handle text input change
  const handleQtyTextChange = (key: string, value: string) => {
    setLines(prev => prev.map(l => l.key === key ? { ...l, quantity: parseInt(value) || 0 } : l));
  };

  const handleQtyBlur = async (key: string) => {
    const line = lines.find(l => l.key === key);
    if (!line || !pricing) return;

    lineFocusRef.current[key] = false;

    let newQty = line.quantity;
    const moq = line.variantId === null ? pricing.supplierItem.moq : 1;
    const availableQty = line.variantId === null
      ? pricing.supplierItem.availableQty
      : pricing.variants.find(v => v.id === line.variantId)?.availableQty ?? 999999;

    // Clamp and fetch fresh quote
    newQty = Math.max(moq, Math.min(availableQty, newQty || moq));

    if (line.variantId === null) {
      try {
        const quote = await wholesaleApi.priceQuote(pricing.supplierItem.id, { quantity: newQty });
        updateLineQuantity(key, newQty, quote.unitPrice);
      } catch {
        updateLineQuantity(key, newQty, line.unitPrice);
      }
    } else {
      updateLineQuantity(key, newQty, line.unitPrice);
    }
  };

  // Calculate total subtotal
  const totalSubtotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.subtotal, 0);
  }, [lines]);

  // Determine active tier index for highlighting (base item only)
  const activeTierIndex = useMemo(() => {
    if (!pricing || pricing.priceTiers.length === 0) return -1;
    const baseLine = lines.find(l => l.variantId === null);
    if (!baseLine) return -1;

    return pricing.priceTiers.findIndex(tier => {
      const minOk = baseLine.quantity >= tier.minQty;
      const maxOk = tier.maxQty === null || tier.maxQty === undefined ? true : baseLine.quantity <= tier.maxQty;
      return minOk && maxOk;
    });
  }, [lines, pricing]);

  // Handle add to cart submission
  const handleAddToCart = async () => {
    if (!pricing || lines.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const cartItems = lines.map(line => ({
        supplierItemId: pricing.supplierItem.id,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.subtotal,
      }));

      // Check if user is authenticated
      let isAuthenticated = false;
      try {
        const token = localStorage.getItem("access_token");
        isAuthenticated = !!token;
      } catch {}

      if (isAuthenticated) {
        // Authenticated: call server endpoint for each item
        const results = await Promise.allSettled(
          cartItems.map(item => wholesaleApi.addToCart({
            supplierItemId: pricing.supplierItem.id,
            variantId: item.variantId,
            quantity: item.quantity,
          }))
        );

        const failed = results.filter(r => r.status === "rejected");
        if (failed.length > 0) {
          setSubmitError(`${failed.length} item(s) failed to add. Please check stock availability.`);
          return;
        }
      } else {
        // Guest: store locally
        const localCart = getLocalCart();
        const merged = [...localCart, ...cartItems.map(item => ({
          ...item,
          addedAt: new Date().toISOString(),
        }))];
        saveLocalCart(merged);
      }

      onSuccess?.();
      router.push("/wholesale/checkout");
      onClose();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setSubmitError("Failed to add items to cart. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (loading || !pricing) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-xl bg-white p-6 w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { supplierItem, priceTiers, variants } = pricing;

  return (
    <>
      {/* Overlay covering full viewport */}
      <div className="fixed inset-0 z-[100] bg-black/50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative rounded-xl bg-white p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {/* Header with Price Tiers */}
            {priceTiers.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Pricing Tiers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {priceTiers.map((tier, index) => (
                    <div
                      key={tier.id}
                      className={`rounded-lg p-3 text-center ${
                        index === activeTierIndex
                          ? "border-2 border-emerald-600 bg-emerald-50"
                          : "border border-slate-200"
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-600 mb-1">
                        {tierLabel(tier)}
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        ₱{tier.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">/ {tier.currency}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Title */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{supplierItem.name}</h3>
              {supplierItem.image && (
                <img
                  src={supplierItem.image}
                  alt={supplierItem.name}
                  className="mt-2 h-20 w-20 object-cover rounded-lg"
                />
              )}
            </div>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Option to Add
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) handleAddLine(val === "base" ? null : val);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Choose to add...</option>
                  <option value="base">Original / {supplierItem.name} (Tiered Pricing)</option>
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name || variant.optionIds.join(" / ")} - ₱{variant.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cart Lines */}
            {lines.length > 0 && (
              <div className="space-y-4 mb-6">
                {lines.map((line) => {
                  const availableQty = line.variantId === null
                    ? supplierItem.availableQty
                    : variants.find(v => v.id === line.variantId)?.availableQty ?? 999999;
                  const moq = line.variantId === null ? supplierItem.moq : 1;

                  return (
                    <div key={line.key} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {line.thumbnail && (
                            <img
                              src={line.thumbnail}
                              alt={line.label}
                              className="h-10 w-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{line.label}</p>
                            <p className="text-sm text-slate-500">
                              ₱{line.unitPrice.toLocaleString()} per unit
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeLine(line.key)}
                          className="rounded-lg p-1 text-slate-400 hover:text-red-500"
                          aria-label="Remove"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Quantity</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(line.key, -1)}
                            disabled={line.quantity <= moq}
                            className="rounded-lg p-2 border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Minus className="size-4" />
                          </button>
                          <input
                            type="number"
                            value={line.quantity}
                            onChange={(e) => handleQtyTextChange(line.key, e.target.value)}
                            onBlur={() => handleQtyBlur(line.key)}
                            onFocus={() => { lineFocusRef.current[line.key] = true; }}
                            min={moq}
                            max={availableQty}
                            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center"
                          />
                          <button
                            onClick={() => handleQuantityChange(line.key, 1)}
                            disabled={line.quantity >= availableQty}
                            className="rounded-lg p-2 border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-right text-sm font-medium text-slate-900">
                        Subtotal: ₱{line.subtotal.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ₱{totalSubtotal.toLocaleString()}
                </span>
              </div>

              {submitError && (
                <p className="mb-2 text-sm text-red-600">{submitError}</p>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isSubmitting || totalSubtotal === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <ShoppingCart className="size-5" />
                {isSubmitting ? "Adding..." : "Add to Cart"}
              </button>

              <button
                onClick={() => setShowProtection(true)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Shield className="size-4" />
                Kompra.ph Order Protection &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrderProtectionModal
        isOpen={showProtection}
        onClose={() => setShowProtection(false)}
      />
    </>
  );
}