"use client";

import { useRouter } from "next/navigation";
import { MapPin, Search, X } from "lucide-react";
import { useEffect } from "react";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";
import { useGeolocation } from "@/hooks/useGeolocation";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  onSelectItem?: (item: SearchSuggestion) => void;
  variant?: "dark" | "light";
  initialQuery?: string;
  showNearbyLink?: boolean;
};

export default function SearchBar({
  placeholder = "Search products...",
  className = "",
  onSelectItem,
  variant = "dark",
  initialQuery,
  showNearbyLink = true,
}: SearchBarProps) {
  const router = useRouter();
  const {
    coords,
    cityName,
    showBanner,
    requestLocation,
    dismissBanner,
  } = useGeolocation();

  const {
    query,
    setQuery,
    suggestions,
    loading,
    error,
    isOpen,
    setIsOpen,
    close,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    containerRef,
  } = useSearch(coords?.lat, coords?.lng);

  // Pre-fill from a URL param (e.g. arriving from the "See all outlets
  // near you" link) and open the dropdown immediately so results show
  // without the user needing to retype or refocus.
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToProduct = (item: SearchSuggestion) => {
    close();
    setQuery(item.item_name);
    if (onSelectItem) {
      onSelectItem(item);
    } else {
      router.push(`/product/${item.inventory_item_id}`);
    }
  };

  const goToNearbySearch = () => {
    close();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/search/nearby?q=${encodeURIComponent(trimmed)}` : "/search/nearby"
    );
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions-listbox"
          aria-activedescendant={
            selectedIndex >= 0 ? `search-suggestion-${selectedIndex}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => handleKeyDown(e, goToProduct)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2f8f83] focus:ring-2 focus:ring-[#2f8f83]/20"
        />
      </div>

      {cityName && (
        <p className={`mt-1 flex items-center gap-1 px-1 text-xs ${
          variant === "light" ? "text-slate-500" : "text-[#b7e4d8]"
        }`}>
          <MapPin size={12} />
          Near {cityName}
        </p>
      )}

      {showBanner && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <span className="flex items-center gap-2 text-sm text-slate-700">
            <MapPin size={16} className="shrink-0 text-[#2f8f83]" />
            Enable location for better results
          </span>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={requestLocation}
              className="rounded-lg bg-[#2f8f83] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#26756b]"
            >
              Enable
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss"
              className="text-slate-400 transition hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[28rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <ul
            id="search-suggestions-listbox"
            role="listbox"
            aria-label="Search suggestions"
            className="max-h-96 overflow-y-auto p-1.5"
          >
            {loading && (
              <li className="px-3 py-3 text-sm text-slate-400" aria-live="polite">
                Searching…
              </li>
            )}

            {!loading && error && (
              <li className="px-3 py-3 text-sm text-red-500" role="alert">
                {error}
              </li>
            )}

            {!loading && !error && suggestions.length === 0 && (
              <li className="px-3 py-3 text-sm text-slate-400">
                No matches for &quot;{query.trim()}&quot;
              </li>
            )}

            {!loading &&
              !error &&
              suggestions.map((item, index) => (
                <li
                  key={item.item_id}
                  id={`search-suggestion-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => goToProduct(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                    index === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                    {item.category_icon ? (
                      <img
                        src={item.category_icon}
                        alt=""
                        className="h-5 w-5 object-contain"
                      />
                    ) : item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Search size={14} className="text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.item_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {item.outlet_name}
                      {item.distance_km !== null && (
                        <span> · {item.distance_km.toFixed(1)} km away</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
          </ul>

          {showNearbyLink && (
            <button
              type="button"
              onClick={goToNearbySearch}
              className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-[#2f8f83] transition hover:bg-slate-50"
            >
              <MapPin size={16} />
              See all outlets near you
            </button>
          )}
        </div>
      )}
    </div>
  );
}