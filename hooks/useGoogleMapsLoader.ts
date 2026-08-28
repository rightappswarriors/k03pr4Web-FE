"use client";

import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";

declare global {
  interface Window { gm_authFailure?: () => void; }
}

// One stable script identity prevents competing Google Maps script loads.
const MAPS_LOADER_ID = "kompra-google-maps-js";
const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_WEB_KEY || "";

export function useGoogleMapsLoader() {
  const loader = useJsApiLoader({ id: MAPS_LOADER_ID, googleMapsApiKey: mapsApiKey });
  const [authenticationError, setAuthenticationError] = useState<Error | null>(null);

  useEffect(() => {
    const previous = window.gm_authFailure;
    window.gm_authFailure = () => {
      const error = new Error("Google Maps authentication failed.");
      setAuthenticationError(error);
      if (process.env.NODE_ENV === "development") console.warn("[Kompra Maps] authentication failed; showing manual-address fallback");
      previous?.();
    };
    return () => { window.gm_authFailure = previous; };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.info("[Kompra Maps] loader", { loader: MAPS_LOADER_ID, keyConfigured: Boolean(mapsApiKey) });
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (loader.isLoaded) console.info("[Kompra Maps] JavaScript API initialized successfully");
    if (loader.loadError || authenticationError) {
      const error = loader.loadError || authenticationError;
      console.warn("[Kompra Maps] JavaScript API failed to initialize", { name: error!.name, message: error!.message });
    }
  }, [loader.isLoaded, loader.loadError, authenticationError]);

  return { ...loader, loadError: loader.loadError || authenticationError };
}

export { MAPS_LOADER_ID };
