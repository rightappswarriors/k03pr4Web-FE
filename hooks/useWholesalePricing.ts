// hooks/useWholesalePricing.ts
// Client-side mirror of the bracket pricing rule for optimistic UI
// IMPORTANT: Keep this logic in sync with wholesale.service.ts:priceQuote
import { useCallback } from "react";

export type PriceTier = {
  id: string;
  minQty: number;
  maxQty?: number;
  price: number;
  currency: string;
};

export type SupplierItemPricing = {
  id: string;
  unitPrice: number;
  moq: number;
  availableQty: number;
};

export type PriceQuote = {
  unitPrice: number;
  subtotal: number;
  tierApplied: PriceTier | null;
};

/**
 * Bracket pricing: find the single tier where minQty <= Q <= maxQty (or maxQty is null).
 * ALL units are charged at that tier's price (not marginal/incremental).
 * Example: tier 1-1000 = ₱1000, tier 1001+ = ₱990, order 1050 units → 1050 × ₱990 = ₱1,039,500
 */
export function computeBracketPrice(
  quantity: number,
  priceTiers: PriceTier[]
): PriceTier | null {
  if (priceTiers.length === 0) return null;

  // Sort by minQty ascending
  const sorted = [...priceTiers].sort((a, b) => a.minQty - b.minQty);

  for (const tier of sorted) {
    const minOk = quantity >= tier.minQty;
    const maxOk = tier.maxQty === undefined || tier.maxQty === null ? true : quantity <= tier.maxQty;
    if (minOk && maxOk) {
      return tier;
    }
  }

  // If quantity is above the last tier's maxQty and that tier has no maxQty, use it
  const highestTier = sorted[sorted.length - 1];
  if (highestTier.maxQty === undefined || highestTier.maxQty === null) {
    if (quantity >= highestTier.minQty) {
      return highestTier;
    }
  }

  return null;
}

export function useWholesalePricing() {
  const computePrice = useCallback((
    quantity: number,
    priceTiers: PriceTier[],
    moq: number,
    availableQty: number,
    hasVariants: boolean,
    variantPrice?: number
  ): PriceQuote => {
    // MOQ always applies — item-level MOQ, whether or not a variant is selected
    if (quantity < moq) {
      throw new Error(`Minimum order quantity is ${moq}`);
    }

    // Inventory check — variant's availableQty when a variant is selected,
    // otherwise the base item's availableQty (caller passes the right one in)
    if (quantity > availableQty) {
      throw new Error(`Only ${availableQty} units available in stock`);
    }

    // Tier resolves the same way whether or not a variant is selected;
    // variantPrice is only a fallback when no tier matches.
    const tierApplied = computeBracketPrice(quantity, priceTiers);

    if (hasVariants && variantPrice !== undefined) {
      const unitPrice = tierApplied?.price ?? variantPrice;
      return {
        unitPrice,
        subtotal: unitPrice * quantity,
        tierApplied,
      };
    }

    if (!tierApplied && priceTiers.length === 0) {
      // No tiers defined, caller should use unitPrice from product
      throw new Error("No pricing tiers available");
    }

    const appliedTier = tierApplied || priceTiers[0];
    return {
      unitPrice: appliedTier.price,
      subtotal: appliedTier.price * quantity,
      tierApplied,
    };
  }, []);

  return { computePrice };
}