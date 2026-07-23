"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SearchSuggestion = {
  item_id: number;
  // The product detail page and cart key off InventoryItems.id, not Item.id —
  // this is the field to use for navigation/add-to-cart, not item_id.
  inventory_item_id: number;
  item_name: string;
  image: string | null;
  category_name: string | null;
  category_icon: string | null;
  outlet_id: number;
  outlet_name: string;
  outlet_photo: string | null;
  price: number;
  quantity: number;
  order_count?: number;
  affinity_count?: number;
  distance_km: number | null;
};

type SearchSuggestionsResponse = {
  items: SearchSuggestion[];
  personalized: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEBOUNCE_MS = 300;

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("access") : null;
}

async function fetchSuggestions(
  keyword: string,
  lat?: number,
  lng?: number
): Promise<SearchSuggestionsResponse> {
  const params = new URLSearchParams({ keyword });
  if (lat !== undefined) params.set("lat", String(lat));
  if (lng !== undefined) params.set("lng", String(lng));

  const token = getToken();
  const headers: Record<string, string> = {};
  // Search works for guests too — only attach the token if we have one,
  // never require it.
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/search/suggestions?${params.toString()}`, {
    headers,
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Failed to fetch search suggestions.");
  }
  return data as SearchSuggestionsResponse;
}

export function useSearch(lat?: number, lng?: number) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [personalized, setPersonalized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // Close on outside click.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch whenever the query changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSuggestions(trimmed, lat, lng);
        // Ignore stale responses if a newer request has since started.
        if (currentRequestId !== requestIdRef.current) return;
        setSuggestions(data.items);
        setPersonalized(data.personalized);
        setSelectedIndex(-1);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        setSuggestions([]);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (currentRequestId === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, lat, lng]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, onSelect: (item: SearchSuggestion) => void) => {
      if (!isOpen || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onSelect(suggestions[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        close();
      }
    },
    [isOpen, suggestions, selectedIndex, close]
  );

  return {
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
    personalized,
    containerRef,
  };
}