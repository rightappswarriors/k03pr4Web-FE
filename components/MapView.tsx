// components/MapView.tsx
"use client";

import { GoogleMap, OverlayView } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";
import { Locate } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsLoader";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const DEFAULT_ZOOM = 13;

export type MapOutlet = {
  outletId: number;
  name: string;
  latitude: number;
  longitude: number;
  price?: number;
  distance?: number;
};

type MapViewProps = {
  outlets?: MapOutlet[];
  activeOutletId?: number | null;
  onPinClick?: (outletId: number) => void;
  onPinHover?: (outletId: number | null) => void;
};

export default function MapView({
  outlets = [],
  activeOutletId = null,
  onPinClick,
  onPinHover,
}: MapViewProps) {
  const { coords, status, requestLocation } = useGeolocation();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<number | null>(null);

  const { isLoaded } = useGoogleMapsLoader();

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
          styles: [
            {
              featureType: "poi",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {/* User's own pulsing location dot */}
        <OverlayView
          position={{ lat: coords.lat, lng: coords.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span className="absolute h-6 w-6 rounded-full bg-blue-500 opacity-75 animate-ping" />
            <span className="relative h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow" />
          </div>
        </OverlayView>

        {/* Numbered outlet pins */}
        {outlets.map((outlet, index) => {
          const isActive = outlet.outletId === activeOutletId;
          const isHovered = outlet.outletId === hoveredPinId;

          return (
            <OverlayView
              key={outlet.outletId}
              position={{ lat: outlet.latitude, lng: outlet.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative -translate-x-1/2 -translate-y-full">
                <button
                  type="button"
                  onClick={() => onPinClick?.(outlet.outletId)}
                  onMouseEnter={() => {
                    setHoveredPinId(outlet.outletId);
                    onPinHover?.(outlet.outletId);
                  }}
                  onMouseLeave={() => {
                    setHoveredPinId(null);
                    onPinHover?.(null);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg transition ${
                    isActive
                      ? "bg-[#1f6b5f] scale-125 z-20 ring-4 ring-[#2f8f83]/30"
                      : isHovered
                      ? "bg-[#4fb3a3] scale-110 z-10"
                      : "bg-[#2f8f83] z-10"
                  }`}
                >
                  {index + 1}
                </button>

                {/* Hover tooltip — shows name/price without needing a click */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 mb-2 w-max max-w-[180px] -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg z-30">
                    <p className="font-semibold">{outlet.name}</p>
                    {outlet.distance !== undefined && (
                      <p className="text-slate-300">{outlet.distance.toFixed(1)} km away</p>
                    )}
                    {outlet.price !== undefined && (
                      <p className="text-slate-300">₱{outlet.price.toFixed(2)}</p>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
            </OverlayView>
          );
        })}
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
