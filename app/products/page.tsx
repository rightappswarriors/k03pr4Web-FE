"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/ui/ProductGrid";
import { Search, SlidersHorizontal } from "lucide-react";
import type { ApiProduct } from "@/types/api-product";

type ApiCategory = {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  product_count?: number;
};

export default function ProductsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);

  const [sortBy, setSortBy] = useState("default");
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minRating, setMinRating] = useState("any");

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is missing");
        }

        const res = await fetch(`${API_URL}/categories/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("CATEGORIES ERROR RESPONSE:", errorText);
          throw new Error(`Failed to fetch categories. Status: ${res.status}`);
        }

        const data: ApiCategory[] = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("LOAD CATEGORIES ERROR:", err);
        setCategories([]);
      }
    };

    loadCategories();
  }, [API_URL]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is missing");
        }

        const trimmedSearch = searchQuery.trim();
        const productUrl = trimmedSearch
          ? `${API_URL}/products/?search=${encodeURIComponent(trimmedSearch)}`
          : `${API_URL}/products/`;

        const res = await fetch(productUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("PRODUCTS ERROR RESPONSE:", errorText);
          throw new Error(`Failed to fetch products. Status: ${res.status}`);
        }

        const data: ApiProduct[] = await res.json();
        const productList = Array.isArray(data) ? data : [];

        console.log("PRODUCTS DEBUG:", productList); 

        setProducts(productList);

        const highestPrice =
          productList.length > 0
            ? Math.max(...productList.map((product) => Number(product.price) || 0))
            : 1000;

        setMaxPrice(highestPrice);
      } catch (err) {
        console.error("LOAD PRODUCTS ERROR:", err);
        setProducts([]);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(() => {
      loadProducts();
    }, 400);

    return () => clearTimeout(delay);
  }, [API_URL, searchQuery]);

  const storeOptions = useMemo(() => {
    return Array.from(
      new Map(
        products.map((product) => [
          String(product.outlet_id),
          {
            id: String(product.outlet_id),
            name: product.outlet_name,
          },
        ])
      ).values()
    );
  }, [products]);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "all"
          ? true
          : String((product as any).category_id ?? "") === selectedCategory;

      const matchesPrice = showFilters
        ? Number(product.price) <= maxPrice
        : true;

      const matchesStore =
        !showFilters || selectedStore === "all"
          ? true
          : String(product.outlet_id) === selectedStore;

      const matchesRating = true;

      return matchesCategory && matchesPrice && matchesStore && matchesRating;
    })
    .sort((a, b) => {
      if (!showFilters || sortBy === "default") return 0;
      if (sortBy === "price-low-high") return Number(a.price) - Number(b.price);
      if (sortBy === "price-high-low") return Number(b.price) - Number(a.price);
      if (sortBy === "name-a-z") return a.name.localeCompare(b.name);
      if (sortBy === "name-z-a") return b.name.localeCompare(a.name);
      return 0;
    });

  const highestProductPrice =
    products.length > 0
      ? Math.max(...products.map((product) => Number(product.price) || 0))
      : 1000;

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 text-lg">Loading products...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
      <Header />

      <section className="flex-1 container-shell py-8">
        <h1 className="mb-6 font-serif text-3xl font-bold text-slate-900">
          Products
        </h1>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 focus:border-[#2f8f83] focus:outline-none focus:ring-2 focus:ring-[#2f8f83]/25"
              placeholder="Search products..."
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl bg-[#3a9688] px-5 py-3 font-bold text-white transition-all hover:opacity-90 active:scale-95"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              selectedCategory === "all"
                ? "border-[#3a9688] bg-[#3a9688] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(String(category.id))}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === String(category.id)
                  ? "border-[#3a9688] bg-[#3a9688] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="px-2">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm"
                >
                  <option value="default">Default</option>
                  <option value="price-low-high">Low → High</option>
                  <option value="price-high-low">High → Low</option>
                  <option value="name-a-z">A → Z</option>
                  <option value="name-z-a">Z → A</option>
                </select>
              </div>

              <div className="px-2">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Store Location
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm"
                >
                  <option value="all">All Stores</option>
                  {storeOptions.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-2 pr-4">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Price: ₱0 — ₱{maxPrice}
                </label>
                <div className="flex h-12 items-center">
                  <input
                    type="range"
                    min="0"
                    max={highestProductPrice}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded bg-[#3a9688] accent-[#3a9688]"
                  />
                </div>
              </div>

              <div className="px-2 pl-4">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Min Rating
                </label>
                <div className="flex h-12 items-center gap-3">
                  {["any", "3", "4", "4.5"].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setMinRating(rating)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                        minRating === rating
                          ? "border-[#3a9688] bg-[#3a9688] text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {rating === "any" ? "Any" : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-lg font-medium text-red-600">
              Failed to load products
            </p>
            <p className="mt-2 text-slate-500">{error}</p>
            <p className="mt-2 text-sm text-slate-400">
              Check your backend server, API URL, and Django console.
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid items={filteredProducts} />
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <p className="text-lg font-medium text-slate-900">
              No products found
            </p>
            <p className="text-slate-500">
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSortBy("default");
                setSelectedStore("all");
                setMinRating("any");
                setMaxPrice(highestProductPrice);
              }}
              className="mt-4 font-bold text-[#3a9688] hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}