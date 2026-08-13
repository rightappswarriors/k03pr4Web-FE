// store/useGeolocationStore.ts
import { create } from "zustand";

type Coords = { lat: number; lng: number };

type GeolocationStore = {
  coords: Coords | null;
  cityName: string | null;
  status: "idle" | "granted" | "denied" | "unsupported";
  loadingCity: boolean;
  showBanner: boolean;
  hasInitialized: boolean;
  init: () => void;
  requestLocation: () => void;
  dismissBanner: () => void;
};

const COORDS_STORAGE_KEY = "kompra_location_coords";
const CITY_STORAGE_KEY = "kompra_location_city";
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
    { headers: { "User-Agent": "KompraApp/1.0" } }
  );
  if (!res.ok) throw new Error("Failed to reverse geocode.");
  const data = await res.json();
  const address = data?.address || {};
  return (
    address.city || address.town || address.municipality || address.village || "your area"
  );
}

export const useGeolocationStore = create<GeolocationStore>((set, get) => ({
  coords: null,
  cityName: null,
  status: "idle",
  loadingCity: false,
  showBanner: false,
  hasInitialized: false,

  // Runs once, globally, regardless of how many components call it.
  init: () => {
    if (get().hasInitialized) return;
    set({ hasInitialized: true });

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      set({ status: "unsupported", showBanner: false });
      return;
    }

    const cachedCoords = readCachedCoords();
    const cachedCity = readCachedCity();

    if (cachedCoords) {
      set({
        coords: cachedCoords,
        cityName: cachedCity,
        status: "granted",
        loadingCity: false,
        showBanner: false,
      });
      return;
    }

    if (wasDeniedThisSession()) {
      set({ status: "denied", showBanner: false });
      return;
    }

    set({ showBanner: true });
  },

  requestLocation: () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      set({ status: "unsupported", showBanner: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(coords));
        set({
          coords,
          status: "granted",
          showBanner: false,
          loadingCity: true,
        });

        try {
          const city = await reverseGeocode(coords);
          localStorage.setItem(CITY_STORAGE_KEY, city);
          set({ cityName: city, loadingCity: false });
        } catch {
          set({ loadingCity: false });
        }
      },
      () => {
        sessionStorage.setItem(DENIED_SESSION_KEY, "true");
        set({ status: "denied", showBanner: false });
      }
    );
  },

  dismissBanner: () => {
    sessionStorage.setItem(DENIED_SESSION_KEY, "true");
    set({ showBanner: false });
  },
}));