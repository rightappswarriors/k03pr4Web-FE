"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

// 1. Fix the missing marker icon bug in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 2. The "Watcher" component to update view when lat/lng props change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16); // Zoom level 16 for store detail
  }, [center, map]);
  return null;
}

export default function Map({ lat, lng, label }: { lat: number, lng: number, label: string }) {
  const coords: [number, number] = [lat, lng];

  return (
    <MapContainer 
      center={coords} 
      zoom={16} 
      scrollWheelZoom={false} 
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coords} icon={icon} />
      <ChangeView center={coords} />
    </MapContainer>
  );
}