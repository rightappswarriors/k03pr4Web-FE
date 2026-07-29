"use client";

import { useRouter } from "next/navigation";
import { MapPin, Search, X } from "lucide-react";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";
import { useGeolocation } from "@/hooks/useGeolocation";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  placeholder = "Search products...",
  className = "",
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

  const goToProduct = (item: SearchSuggestion) => {
    close();
    setQuery(item.item_name);
    router.push(`/product/${item.inventory_item_id}`);
  };

  // No layout shift on open: the dropdown is absolutely positioned, so it
  // overlays the page rather than pushing content down.
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

      {/* Subtle location indicator, shown once we actually have a city name.
          Uses the header's light accent color (not slate-grey) since this
          sits directly on the dark teal header background, not a white card. */}
      {cityName && (
        <p className="mt-1 flex items-center gap-1 px-1 text-xs text-[#b7e4d8]">
          <MapPin size={12} />
          Near {cityName}
        </p>
      )}

      {/* "Enable location for better results" banner — shown once per
          session per useGeolocation's caching rules. Styled to match the
          suggestions dropdown card below it for visual consistency. */}
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
        <ul
          id="search-suggestions-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
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
      )}
    </div>
  );
}