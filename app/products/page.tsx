"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/ui/ProductGrid";
import {
  ArrowDownUp,
  Layers3,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Store,
} from "lucide-react";
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
        if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is missing");

        const res = await fetch(`${API_URL}/categories/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
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

        if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is missing");

        const trimmedSearch = searchQuery.trim();
        const productUrl = trimmedSearch
          ? `${API_URL}/products/?search=${encodeURIComponent(trimmedSearch)}`
          : `${API_URL}/products/`;

        const res = await fetch(productUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch products. Status: ${res.status}`);
        }

        const data: ApiProduct[] = await res.json();
        const productList = Array.isArray(data) ? data : [];
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

      return matchesCategory && matchesPrice && matchesStore;
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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("default");
    setSelectedStore("all");
    setMinRating("any");
    setMaxPrice(highestProductPrice);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[#f6f4ee]">
        <Header />
        <section className="flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-[#ded8cc] bg-white px-6 py-5 text-center">
            <p className="text-sm font-bold text-[#66706b]">
              Loading products...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f4ee]">
      <Header />

      <section className="container-shell flex-1 py-8 md:py-10">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-[#ded8cc] bg-[#10231f] text-white">
          <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b7e4d8]">
                Product catalog
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                Find stocked products across partner stores.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                Search by product, filter by category or store, and browse items
                with stock and price context before checkout.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 self-end">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <PackageSearch className="h-5 w-5 text-[#b7e4d8]" />
                <p className="mt-3 text-2xl font-black">{products.length}</p>
                <p className="text-xs text-white/60">Products</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <Layers3 className="h-5 w-5 text-[#b7e4d8]" />
                <p className="mt-3 text-2xl font-black">{categories.length}</p>
                <p className="text-xs text-white/60">Categories</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <Store className="h-5 w-5 text-[#b7e4d8]" />
                <p className="mt-3 text-2xl font-black">{storeOptions.length}</p>
                <p className="text-xs text-white/60">Stores</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[1.5rem] border border-[#ded8cc] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a938c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#ded8cc] bg-[#fbfaf6] pl-12 pr-4 text-sm text-[#10231f] outline-none transition placeholder:text-[#8a938c] focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10"
                placeholder="Search products, materials, groceries..."
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition ${
                showFilters
                  ? "bg-[#10231f] text-white"
                  : "bg-[#2f8f83] text-white hover:bg-[#26776d]"
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
              selectedCategory === "all"
                ? "border-[#2f8f83] bg-[#2f8f83] text-white"
                : "border-[#ded8cc] bg-white text-[#5f665f] hover:border-[#2f8f83]/45"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(String(category.id))}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                selectedCategory === String(category.id)
                  ? "border-[#2f8f83] bg-[#2f8f83] text-white"
                  : "border-[#ded8cc] bg-white text-[#5f665f] hover:border-[#2f8f83]/45"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mb-7 rounded-[1.5rem] border border-[#ded8cc] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-[#10231f]">
              <ArrowDownUp className="h-4 w-4 text-[#2f8f83]" />
              Refine catalog
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a938c]">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#ded8cc] bg-[#fbfaf6] px-4 text-sm text-[#10231f] outline-none focus:border-[#2f8f83]"
                >
                  <option value="default">Default</option>
                  <option value="price-low-high">Low to High</option>
                  <option value="price-high-low">High to Low</option>
                  <option value="name-a-z">A to Z</option>
                  <option value="name-z-a">Z to A</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a938c]">
                  Store Location
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#ded8cc] bg-[#fbfaf6] px-4 text-sm text-[#10231f] outline-none focus:border-[#2f8f83]"
                >
                  <option value="all">All Stores</option>
                  {storeOptions.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a938c]">
                  Price: PHP 0 - PHP {maxPrice}
                </label>
                <div className="flex h-12 items-center">
                  <input
                    type="range"
                    min="0"
                    max={highestProductPrice}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded bg-[#2f8f83] accent-[#2f8f83]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a938c]">
                  Min Rating
                </label>
                <div className="flex h-12 items-center gap-2">
                  {["any", "3", "4", "4.5"].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setMinRating(rating)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                        minRating === rating
                          ? "border-[#2f8f83] bg-[#2f8f83] text-white"
                          : "border-[#ded8cc] bg-white text-[#5f665f]"
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
            <p className="text-lg font-bold text-red-600">Failed to load products</p>
            <p className="mt-2 text-[#66706b]">{error}</p>
            <p className="mt-2 text-sm text-[#8a938c]">
              Check your backend server, API URL, and Django console.
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-[#66706b]">
              <p>
                Showing{" "}
                <span className="font-bold text-[#10231f]">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>
              <p className="hidden sm:block">Updated from partner stores</p>
            </div>
            <ProductGrid items={filteredProducts} />
          </>
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <p className="text-lg font-bold text-[#10231f]">No products found</p>
            <p className="text-[#66706b]">
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 font-bold text-[#2f8f83] hover:underline"
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
