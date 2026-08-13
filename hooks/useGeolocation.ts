"use client";

import { useCallback, useEffect, useState } from "react";

type Coords = { lat: number; lng: number };

type GeolocationState = {
  coords: Coords | null;
  cityName: string | null;
  // "idle": haven't asked yet. "granted"/"denied": browser permission result.
  // "unsupported": browser doesn't have the Geolocation API at all.
  status: "idle" | "granted" | "denied" | "unsupported";
  loadingCity: boolean;
  // Whether the "enable location" banner should currently be shown.
  showBanner: boolean;
};

const COORDS_STORAGE_KEY = "kompra_location_coords";
const CITY_STORAGE_KEY = "kompra_location_city";
// Denial is intentionally sessionStorage, not localStorage — per the Task 3
// spec, a "no" should only hide the banner for that browser session, not
// forever. The user gets asked again on their next visit.
const DENIED_SESSION_KEY = "kompra_location_denied";

function readCachedCoords(): Coords | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(COORDS_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Coords;
  } catch {
    return null;
  }
}

function readCachedCity(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CITY_STORAGE_KEY);
}

function wasDeniedThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(DENIED_SESSION_KEY) === "true";
}

async function reverseGeocode(coords: Coords): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
    {
      headers: {
        // Nominatim's usage policy asks for an identifying User-Agent.
        "User-Agent": "KompraApp/1.0",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to reverse geocode.");
  const data = await res.json();
  const address = data?.address || {};
  // Not every location has a clean "city" field — fall back through
  // increasingly broad alternatives rather than showing nothing.
  return (
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    "your area"
  );
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    cityName: null,
    status: "idle",
    loadingCity: false,
    showBanner: false,
  });

  // On mount: check cache first, decide whether to show the banner at all.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((prev) => ({ ...prev, status: "unsupported", showBanner: false }));
      return;
    }

    const cachedCoords = readCachedCoords();
    const cachedCity = readCachedCity();

    if (cachedCoords) {
      // Already granted before — use the cached result, don't re-prompt.
      setState({
        coords: cachedCoords,
        cityName: cachedCity,
        status: "granted",
        loadingCity: false,
        showBanner: false,
      });
      return;
    }

    if (wasDeniedThisSession()) {
      // Denied earlier this session — stay quiet, per the spec's fallback.
      setState((prev) => ({ ...prev, status: "denied", showBanner: false }));
      return;
    }

    // No cache, no prior denial this session — this is a fresh prompt.
    setState((prev) => ({ ...prev, showBanner: true }));
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((prev) => ({ ...prev, status: "unsupported", showBanner: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(coords));
        setState((prev) => ({
          ...prev,
          coords,
          status: "granted",
          showBanner: false,
          loadingCity: true,
        }));

        try {
          const city = await reverseGeocode(coords);
          localStorage.setItem(CITY_STORAGE_KEY, city);
          setState((prev) => ({ ...prev, cityName: city, loadingCity: false }));
        } catch {
          // Reverse geocoding failing shouldn't break search — we still
          // have coords for proximity ranking, just no display name.
          setState((prev) => ({ ...prev, loadingCity: false }));
        }
      },
      () => {
        // User denied, or the browser couldn't get a position.
        sessionStorage.setItem(DENIED_SESSION_KEY, "true");
        setState((prev) => ({ ...prev, status: "denied", showBanner: false }));
      }
    );
  }, []);

  const dismissBanner = useCallback(() => {
    // Treated the same as a denial for this session — the user chose not
    // to engage, so don't keep asking.
    sessionStorage.setItem(DENIED_SESSION_KEY, "true");
    setState((prev) => ({ ...prev, showBanner: false }));
  }, []);

  return {
    ...state,
    requestLocation,
    dismissBanner,
  };
}