// services/wholesale.service.ts
import { agentFetch } from "@/lib/agent-api-client";
import type {
  WholesaleBanner,
  WholesaleCategory,
  WholesaleProduct,
  WholesaleSupplier,
  WholesaleQuote,
  RFQFormData,
  PricingQuote,
} from "@/types/wholesale";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Lightweight fetch for **public** wholesale endpoints.
 * Does NOT include auth headers or refresh logic — these endpoints
 * are accessible by guests and retail users.
 */
async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/wholesale${path}`);
  if (!res.ok) throw new Error(`Wholesale API error: ${res.status} ${path}`);
  return res.json() as T;
}

export const wholesaleApi = {
  // ─── Public endpoints (no auth required) ─────────────────────────────────
  getProducts: async (params?: Record<string, string>): Promise<WholesaleProduct[]> => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    try {
      return await publicFetch(`/products${qs}`);
    } catch (err) {
      console.error("getProducts failed:", err);
      return []; // let the page render empty/loading state instead of crashing
    }
  },

  getProduct: (id: string): Promise<WholesaleProduct> =>
    publicFetch(`/products/${id}`),

  getSuppliers: (): Promise<WholesaleSupplier[]> =>
    publicFetch(`/suppliers/featured`),

  getCategories: (): Promise<WholesaleCategory[]> =>
    publicFetch(`/categories`),

  // No Banner model yet — keep a light local fallback instead of hitting the API
  getBanners: (): Promise<WholesaleBanner[]> =>
    Promise.resolve([
      {
        id: "banner-1",
        eyebrow: "Wholesale Deals",
        title: "Exclusive deals for bulk buyers",
        copy: "Save more when you buy directly from verified suppliers.",
        image: "",
      },
    ]),

  getPopularSearches: (): Promise<string[]> =>
    publicFetch(`/search/popular`),

  suggestProducts: (term: string): Promise<WholesaleProduct[]> =>
    publicFetch(`/search/suggest?q=${encodeURIComponent(term)}`),

  getFrequentlySearchedProducts: (): Promise<WholesaleProduct[]> =>
    publicFetch(`/frequently-searched-products`),

  trackSearch: (term: string): Promise<{ logged: boolean }> =>
    publicFetch(`/search/track`),

  getProductsByIds: (ids: string[]): Promise<WholesaleProduct[]> =>
    ids.length ? publicFetch(`/products/by-ids?ids=${ids.join(",")}`) : Promise.resolve([]),

  getRecommendations: (): Promise<WholesaleProduct[]> =>
    publicFetch(`/home`).then((d: any) => d.recommendations),

  search: (term: string): Promise<WholesaleProduct[]> =>
    publicFetch(`/products?search=${encodeURIComponent(term)}`),

  getQuotes: (): Promise<WholesaleQuote[]> =>
    publicFetch(`/quotes`),

  getQuote: (id: string): Promise<WholesaleQuote | null> =>
    publicFetch<WholesaleQuote[]>(`/quotes`).then((quotes) => quotes.find((q) => q.id === id) ?? null),

  getPricing: (id: string): Promise<any> =>
    publicFetch(`/supplier-items/${id}/pricing`),

  priceQuote: (id: string, body: { quantity: number; variantId?: string }) =>
    publicFetch<PricingQuote>(`/supplier-items/${id}/price-quote`),

  // ─── Agent-protected endpoints (use agentFetch with auto-refresh) ─────────
  submitRFQForm: (data: RFQFormData & { productId: string }): Promise<{ success: boolean; quoteId: string }> =>
    agentFetch(`/wholesale/rfq`, { method: "POST", body: JSON.stringify(data) }),

  addToCart: (body: { supplierItemId: string; variantId?: string; quantity: number }) =>
    agentFetch(`/wholesale/cart/add`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  startOrder: (body: { supplierItemId: string; variantId?: string; quantity: number }) =>
    agentFetch(`/wholesale/orders/start`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
