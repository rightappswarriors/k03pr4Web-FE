// components/MapView.tsx
"use client";

import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";
import { Locate } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Zoom 13 is the commonly used approximation for a ~5km radius view
// (Google Maps zoom-to-distance isn't linear/exact).
const DEFAULT_ZOOM = 13;

export default function MapView() {
  const { coords, status, requestLocation } = useGeolocation();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_WEB_KEY || "",
  });

  // Request location on mount, once — same pattern as the search feature,
  // but MapView needs it immediately rather than behind a banner tap.
  useEffect(() => {
    if (status === "idle") {
      requestLocation();
    }
  }, [status, requestLocation]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleRecenter = useCallback(() => {
    if (map && coords) {
      map.panTo({ lat: coords.lat, lng: coords.lng });
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [map, coords]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full space-y-2 text-slate-500 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#3a9688]" />
        <p className="text-sm font-medium">Loading Map...</p>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full space-y-2 text-slate-600 bg-slate-100 rounded-2xl border border-slate-200 px-6 text-center">
        <p className="text-sm font-semibold text-slate-700">
          {status === "denied"
            ? "Location access denied. Enable it to see nearby outlets."
            : "Getting your location..."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: coords.lat, lng: coords.lng }}
        zoom={DEFAULT_ZOOM}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          scrollwheel: true,
        }}
      >
        <OverlayView
          position={{ lat: coords.lat, lng: coords.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span className="absolute h-6 w-6 rounded-full bg-blue-500 opacity-75 animate-ping" />
            <span className="relative h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow" />
          </div>
        </OverlayView>
      </GoogleMap>

      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 z-10 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-50 transition"
        aria-label="Recenter map to your location"
      >
        <Locate className="h-5 w-5 text-[#3a9688]" />
      </button>
    </div>
  );
}