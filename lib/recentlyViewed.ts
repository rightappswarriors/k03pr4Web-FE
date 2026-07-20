// lib/recentlyViewed.ts
import { getStorageScope } from "./storageScope";

const BASE_KEY = "wholesale_recently_viewed";
const MAX = 10;

function key() {
  return `${BASE_KEY}:${getStorageScope()}`;
}

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key()) ?? "[]");
  } catch {
    return [];
  }
}

export function trackProductView(productId: string) {
  const existing = getRecentlyViewedIds().filter((id) => id !== productId);
  localStorage.setItem(key(), JSON.stringify([productId, ...existing].slice(0, MAX)));
}