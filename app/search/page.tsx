"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Search,
  Package,
  Store,
  Tags,
  Building2,
  MapPin,
} from "lucide-react";

type SearchProduct = {
  inventory_item_id: number;
  product_id: number;
  name: string;
  image?: string | null;
  description?: string | null;
  category_name?: string | null;
  price: number;
  quantity: number;
  outlet_id: number;
  outlet_name: string;
};

type SearchStore = {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
};

type SearchCategory = {
  id: number;
  name: string;
  description?: string | null;
};

type SearchOrganization = {
  id: number;
  name: string;
  slug: string; 
};

type SearchBranch = {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  org_slug: string;
};

type SearchResponse = {
  products: SearchProduct[];
  stores: SearchStore[];
  categories: SearchCategory[];
  organizations: SearchOrganization[];
  branches: SearchBranch[];
};

type ResultTab =
  | "all"
  | "products"
  | "stores"
  | "categories"
  | "organizations"
  | "branches";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState<ResultTab>("all");

  const q = encodeURIComponent(query);

  const [results, setResults] = useState<SearchResponse>({
    products: [],
    stores: [],
    categories: [],
    organizations: [],
    branches: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_BASE_URL = API_URL?.replace("/api", "") || "";

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is missing");
        }

        if (!query.trim()) {
          setResults({
            products: [],
            stores: [],
            categories: [],
            organizations: [],
            branches: [],
          });
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_URL}/search/?q=${encodeURIComponent(query.trim())}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("SEARCH ERROR RESPONSE:", errorText);
          throw new Error(`Failed to fetch search results. Status: ${res.status}`);
        }

        const data: SearchResponse = await res.json();

        setResults({
          products: Array.isArray(data.products) ? data.products : [],
          stores: Array.isArray(data.stores) ? data.stores : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
          organizations: Array.isArray(data.organizations)
            ? data.organizations
            : [],
          branches: Array.isArray(data.branches) ? data.branches : [],
        });
      } catch (err) {
        console.error("LOAD SEARCH ERROR:", err);
        setError(err instanceof Error ? err.message : "Failed to load search results");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [API_URL, query]);

  const getImageUrl = (image: string | null | undefined) => {
    if (!image) return "/img/green_logo.png";
    if (image.startsWith("http")) return image;
    return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const counts = useMemo(() => {
    return {
      all:
        results.products.length +
        results.stores.length +
        results.categories.length +
        results.organizations.length +
        results.branches.length,
      products: results.products.length,
      stores: results.stores.length,
      categories: results.categories.length,
      organizations: results.organizations.length,
      branches: results.branches.length,
    };
  }, [results]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const tabs: Array<{ key: ResultTab; label: string }> = [
    { key: "all", label: "All" },
    { key: "products", label: "Products" },
    { key: "stores", label: "Stores" },
    { key: "categories", label: "Categories" },
    { key: "organizations", label: "Organizations" },
    { key: "branches", label: "Branches" },
  ];

  const showAll = activeTab === "all";

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 text-lg">Loading results...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
      <Header />

      <section className="flex-1 container-shell py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">
                Search
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Find products, stores, categories, organizations, and branches.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, stores, categories..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 focus:border-[#2f8f83] focus:outline-none focus:ring-2 focus:ring-[#2f8f83]/20"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-2xl bg-[#2f8f83] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#26756b]"
              >
                Search
              </button>
            </div>

            {query.trim() ? (
              <p className="text-sm text-slate-600">
                Showing results for{" "}
                <span className="font-semibold text-slate-900">"{query}"</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Type a keyword to start searching.
              </p>
            )}
          </div>
        </div>

        {!error && query.trim() && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Results
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.all}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Products
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.products}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Outlets
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.stores}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Categories
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.categories}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Organizations
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.organizations}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Branches
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.branches}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const count = counts[tab.key];
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#2f8f83] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>
          </>
        )}

        {error ? (
          <div className="mt-8 flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-red-100 bg-white text-center shadow-sm">
            <p className="text-lg font-semibold text-red-600">
              Failed to load search results
            </p>
            <p className="mt-2 max-w-xl text-slate-500">{error}</p>
          </div>
        ) : !query.trim() ? (
          <div className="mt-8 flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-center shadow-sm">
            <Search className="h-10 w-10 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-900">
              Start your search
            </p>
            <p className="mt-2 text-slate-500">
              Search for products, stores, categories, organizations, or branches.
            </p>
          </div>
        ) : counts.all === 0 ? (
          <div className="mt-8 flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-center shadow-sm">
            <Search className="h-10 w-10 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-900">
              No results found
            </p>
            <p className="mt-2 text-slate-500">
              Try another keyword or a shorter search term.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {(showAll || activeTab === "products") && results.products.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#2f8f83]" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Products
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {results.products.map((product) => (
                    <Link
                      key={product.inventory_item_id}
                      href={`/product/${product.inventory_item_id}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="aspect-square overflow-hidden bg-slate-100">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {product.category_name || "Uncategorized"}
                        </p>
                        <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-lg font-bold text-[#2f8f83]">
                          ₱{Number(product.price).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Store: {product.outlet_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Stock: {product.quantity}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(showAll || activeTab === "stores") && results.stores.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Store className="h-5 w-5 text-[#2f8f83]" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Outlets
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.stores.map((store) => (
                    <Link
                      key={store.id}
                      href={`/k/locations/${store.id}-${store.name.toLowerCase().replace(/\s+/g, "-")}?type=outlet&from=search&q=${q}`}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h3 className="font-semibold text-slate-900">{store.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {store.address || "No address available"}
                      </p>
                      {store.phone && (
                        <p className="mt-1 text-sm text-slate-400">{store.phone}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(showAll || activeTab === "categories") &&
              results.categories.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <Tags className="h-5 w-5 text-[#2f8f83]" />
                    <h2 className="text-xl font-semibold text-slate-900">
                      Categories
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {results.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {(showAll || activeTab === "organizations") &&
              results.organizations.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[#2f8f83]" />
                    <h2 className="text-xl font-semibold text-slate-900">
                      Organizations
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.organizations.map((org) => (
                      <Link
                        key={org.id}
                        href={`/k/${org.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <h3 className="font-semibold text-slate-900">{org.name}</h3>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {(showAll || activeTab === "branches") &&
              results.branches.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#2f8f83]" />
                    <h2 className="text-xl font-semibold text-slate-900">
                      Branches
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.branches.map((branch) => (
                      <Link
                        key={branch.id}
                        href={`/k/locations/${branch.id}-${branch.name.toLowerCase().replace(/\s+/g, "-")}?type=branch&from=search&q=${q}`}
                        className="rounded-2xl border border-slate-200 bg-white p-5 block transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <h3 className="font-semibold text-slate-900">
                          {branch.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {branch.address || "No address available"}
                        </p>
                        {branch.phone && (
                          <p className="mt-1 text-sm text-slate-400">
                            {branch.phone}
                          </p>
                        )}
                      </Link>

                      
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}