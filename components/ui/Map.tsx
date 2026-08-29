"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsLoader";

interface MapProps {
  lat: number;
  lng: number;
  label?: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function Map({ lat, lng, label = "Location" }: MapProps) {
  const { isLoaded } = useGoogleMapsLoader();

  if (!isLoaded) {
    return (
      <div
        style={{ height: "100%", width: "100%", background: "#ebebeb" }}
        className="flex items-center justify-center"
      >
        <p className="text-sm text-slate-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          scrollwheel: false,
        }}
      >
        <Marker position={{ lat, lng }} title={label} />
      </GoogleMap>
    </div>
  );
}
