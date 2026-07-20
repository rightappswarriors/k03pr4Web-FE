// lib/recentSearches.ts
import { getStorageScope } from "./storageScope";

const BASE_KEY = "wholesale_recent_searches";
const MAX = 8;

function key() {
  return `${BASE_KEY}:${getStorageScope()}`;
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key()) ?? "[]");
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const existing = getRecentSearches().filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
  localStorage.setItem(key(), JSON.stringify([trimmed, ...existing].slice(0, MAX)));
}

export function removeRecentSearch(term: string) {
  const updated = getRecentSearches().filter((t) => t !== term);
  localStorage.setItem(key(), JSON.stringify(updated));
}

export function clearRecentSearches() {
  localStorage.removeItem(key());
}