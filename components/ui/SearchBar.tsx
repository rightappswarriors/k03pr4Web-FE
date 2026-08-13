"use client";

import { Search, Clock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { wholesaleApi } from "@/services/wholesale.service";
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from "@/lib/recentSearches";
import type { WholesaleProduct } from "@/types/wholesale";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) setRecent(getRecentSearches());
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setSuggestions(await wholesaleApi.suggestProducts(trimmed));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const runSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    wholesaleApi.trackSearch(trimmed).catch(() => {});
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const goToProduct = (product: WholesaleProduct) => {
    addRecentSearch(query.trim());
    wholesaleApi.trackSearch(query.trim()).catch(() => {});
    setIsOpen(false);
    router.push(`/wholesale/products/${product.id}`);
  };

  const showDropdown = isOpen && (query.trim() ? suggestions.length > 0 || loading : recent.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <Search
        size={18}
        onClick={() => runSearch(query)}
        className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-[#b7e4d8]"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runSearch(query);
          if (e.key === "Escape") setIsOpen(false);
        }}
        placeholder="Search products, stores, categories..."
        className="h-10 w-full rounded-lg border border-white/15 bg-white/8 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#b7e4d8]/55 focus:border-[#b7e4d8]/55 focus:bg-white/10"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {!query.trim() && recent.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold text-slate-500">Recent searches</span>
                <button
                  onClick={() => { clearRecentSearches(); setRecent([]); }}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Clear
                </button>
              </div>
              {recent.map((term) => (
                <button
                  key={term}
                  onClick={() => runSearch(term)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Clock size={14} className="shrink-0 text-slate-400" />
                  <span className="flex-1 truncate">{term}</span>
                  <X
                    size={14}
                    className="shrink-0 text-slate-300 hover:text-slate-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(term);
                      setRecent(getRecentSearches());
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {query.trim() && (
            <div className="p-2">
              <span className="px-2 py-1 text-xs font-semibold text-slate-500">Products</span>
              {loading && <div className="px-2 py-3 text-sm text-slate-400">Searching…</div>}
              {!loading && suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => goToProduct(product)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                >
                  <img src={product.image} alt={product.name} className="h-9 w-9 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  </div>
                </button>
              ))}
              {!loading && suggestions.length === 0 && (
                <div className="px-2 py-3 text-sm text-slate-400">No matches yet — press Enter to search anyway</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}