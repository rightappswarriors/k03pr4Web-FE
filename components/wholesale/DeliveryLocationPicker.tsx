"use client";

import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { LocateFixed, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsLoader";

export type DeliveryLocation = { address: string; latitude: number | null; longitude: number | null };

export function DeliveryLocationPicker({ value, onChange }: { value: DeliveryLocation; onChange: (value: DeliveryLocation) => void }) {
  const { coords, requestLocation, status } = useGeolocation();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(
    value.latitude != null && value.longitude != null ? { lat: value.latitude, lng: value.longitude } : null,
  );
  const [requestedCurrentLocation, setRequestedCurrentLocation] = useState(false);
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const center = useMemo(() => marker ?? coords ?? { lat: 10.3157, lng: 123.8854 }, [marker, coords]);

  const reverseGeocode = useCallback(async (point: google.maps.LatLngLiteral) => {
    if (!window.google?.maps) return;
    try {
      const result = await new google.maps.Geocoder().geocode({ location: point });
      onChange({ latitude: point.lat, longitude: point.lng, address: result.results[0]?.formatted_address || value.address });
    } catch {
      onChange({ latitude: point.lat, longitude: point.lng, address: value.address });
    }
  }, [onChange, value.address]);

  const choose = useCallback((point: google.maps.LatLngLiteral) => {
    setMarker(point);
    void reverseGeocode(point);
  }, [reverseGeocode]);

  useEffect(() => {
    if (!coords) return;
    mapRef.current?.panTo(coords);
    if (requestedCurrentLocation) {
      setRequestedCurrentLocation(false);
      choose(coords);
    }
  }, [coords, requestedCurrentLocation, choose]);

  return <div className="space-y-3">
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 size-5 shrink-0 text-[#287c72]" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800">Delivery Location</p>
          <p className="mt-1 text-sm text-slate-600">{value.address || "No delivery location selected"}</p>
          {marker && <p className="mt-1 text-xs text-slate-500">Pinned: {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}</p>}
        </div>
      </div>
    </div>
    <label className="block text-sm font-semibold text-slate-700">Delivery address *
      <input value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} placeholder="Search unavailable? Enter the full address here." className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 font-normal" />
    </label>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => { setRequestedCurrentLocation(true); if (coords) choose(coords); else requestLocation(); }} className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#287c72] px-3 py-2 text-sm font-semibold text-[#287c72]">
        <LocateFixed className="size-4" /> Use My Current Location
      </button>
      {status === "denied" && <p className="self-center text-xs text-slate-500">Location permission is unavailable; enter an address or choose a point on the map.</p>}
    </div>
    <div className="h-64 overflow-hidden rounded-xl border border-slate-200 sm:h-72">
      {isLoaded ? <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={center} zoom={marker ? 15 : 12} onLoad={(map) => { mapRef.current = map; }} onClick={(e) => e.latLng && choose({ lat: e.latLng.lat(), lng: e.latLng.lng() })} options={{ streetViewControl: false, mapTypeControl: false }}>
        {marker && <MarkerF position={marker} draggable onDragEnd={(e) => e.latLng && choose({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
      </GoogleMap> : <div className="flex h-full items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-500">{loadError ? "Map unavailable. You can still enter a delivery address manually." : "Loading map…"}</div>}
    </div>
    <p className="text-xs text-slate-500">Click or drag the marker to set a precise location. Coordinates are saved only after confirmation.</p>
  </div>;
}
