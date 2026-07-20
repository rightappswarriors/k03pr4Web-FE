// services/wholesale.service.ts
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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/wholesale${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Wholesale API error: ${res.status} ${path}`);
  return res.json();
}

export const wholesaleApi = {
  getProducts: (params?: Record<string, string>): Promise<WholesaleProduct[]> => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/products${qs}`);
  },

  getProduct: (id: string): Promise<WholesaleProduct> => apiFetch(`/products/${id}`),

  getSuppliers: (): Promise<WholesaleSupplier[]> => apiFetch(`/suppliers/featured`),

  getCategories: (): Promise<WholesaleCategory[]> => apiFetch(`/categories`),

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
  getPopularSearches: (): Promise<string[]> => apiFetch(`/search/popular`),
  suggestProducts: (term: string): Promise<WholesaleProduct[]> =>
    apiFetch(`/search/suggest?q=${encodeURIComponent(term)}`),
  getFrequentlySearchedProducts: (): Promise<WholesaleProduct[]> => apiFetch(`/search/frequently-searched-products`),

  trackSearch: (term: string): Promise<{ logged: boolean }> =>
    apiFetch(`/search/track`, { method: "POST", body: JSON.stringify({ term }) }),

  getProductsByIds: (ids: string[]): Promise<WholesaleProduct[]> =>
    ids.length ? apiFetch(`/products/by-ids?ids=${ids.join(",")}`) : Promise.resolve([]),
  getRecommendations: (): Promise<WholesaleProduct[]> => apiFetch(`/home`).then((d: any) => d.recommendations),


  search: (term: string): Promise<WholesaleProduct[]> => apiFetch(`/products?search=${encodeURIComponent(term)}`),

  submitRFQForm: (data: RFQFormData & { productId: string }): Promise<{ success: boolean; quoteId: string }> =>
    apiFetch(`/rfq`, { method: "POST", body: JSON.stringify(data) }),

  getQuotes: (): Promise<WholesaleQuote[]> => apiFetch(`/quotes`),

  getQuote: (id: string): Promise<WholesaleQuote | null> =>
    apiFetch<WholesaleQuote[]>(`/quotes`).then((quotes) => quotes.find((q) => q.id === id) ?? null),

  // =====================
  // Wholesale Cart/Order Endpoints
  // =====================

  getPricing: (id: string): Promise<any> => apiFetch(`/supplier-items/${id}/pricing`),

  priceQuote: (id: string, body: { quantity: number; variantId?: string }) =>
    apiFetch<PricingQuote>(`/supplier-items/${id}/price-quote`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  addToCart: (body: { supplierItemId: string; variantId?: string; quantity: number }) =>
    apiFetch(`/cart/add`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  startOrder: (body: { supplierItemId: string; variantId?: string; quantity: number }) =>
    apiFetch(`/orders/start`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};