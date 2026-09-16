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

  const sorted = [...priceTiers].sort((a, b) => a.minQty - b.minQty);

  for (const tier of sorted) {
    const minOk = quantity >= tier.minQty;
    const maxOk = tier.maxQty === undefined || tier.maxQty === null ? true : quantity <= tier.maxQty;
    if (minOk && maxOk) {
      return tier;
    }
  }

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
    variantPrice?: number,
    variantPriceTiers: PriceTier[] = []
  ): PriceQuote => {
    // MOQ and inventory always apply, whether or not a variant is selected —
    // caller passes the right availableQty (variant's vs base item's).
    if (quantity < moq) {
      throw new Error(`Minimum order quantity is ${moq}`);
    }
    if (quantity > availableQty) {
      throw new Error(`Only ${availableQty} units available in stock`);
    }

    if (hasVariants && variantPrice !== undefined) {
      // Priority: variant's own tier → variant's own price → parent tier → parent base price
      const variantTierApplied = computeBracketPrice(quantity, variantPriceTiers);
      const parentTierApplied = computeBracketPrice(quantity, priceTiers);

      const tierApplied = variantTierApplied ?? parentTierApplied;
      const unitPrice =
        variantTierApplied?.price ??
        (variantPrice > 0 ? variantPrice : undefined) ??
        parentTierApplied?.price ??
        0; // caller should always have a base unitPrice fallback upstream

      return {
        unitPrice,
        subtotal: unitPrice * quantity,
        tierApplied,
      };
    }

    // No variant selected — base item pricing
    const tierApplied = computeBracketPrice(quantity, priceTiers);

    if (!tierApplied && priceTiers.length === 0) {
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