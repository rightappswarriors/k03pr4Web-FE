// hooks/useGeolocation.ts
"use client";

import { useEffect } from "react";
import { useGeolocationStore } from "@/store/useGeolocationStore";

export function useGeolocation() {
  const store = useGeolocationStore();

  useEffect(() => {
    store.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    coords: store.coords,
    cityName: store.cityName,
    status: store.status,
    loadingCity: store.loadingCity,
    showBanner: store.showBanner,
    requestLocation: store.requestLocation,
    dismissBanner: store.dismissBanner,
  };
}