"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { ServiceRadius } from "@/types/agent";

interface CoverageSelectorProps {
  region: string;
  province: string;
  city: string;
  barangay: string;
  serviceRadius: ServiceRadius;
  onRegionChange: (region: string) => void;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  onBarangayChange: (barangay: string) => void;
  onRadiusChange: (radius: ServiceRadius) => void;
}

const CUSTOM_REGIONS = [
  { region_name: "Metro Manila", codes: ["13"] },
  { region_name: "Mindanao", codes: ["09", "10", "11", "12", "15", "16"] },
  { region_name: "North Luzon", codes: ["01", "02", "03", "14"] },
  { region_name: "South Luzon", codes: ["04", "05", "17"] },
  { region_name: "Visayas", codes: ["06", "07", "08"] },
];

const SERVICE_RADII: ServiceRadius[] = [5, 10, 20, 50];

export default function CoverageSelector({
  region,
  province,
  city,
  barangay,
  serviceRadius,
  onRegionChange,
  onProvinceChange,
  onCityChange,
  onBarangayChange,
  onRadiusChange,
}: CoverageSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "Region" | "Province" | "City" | "Barangay"
  >("Region");

  const selectedArea = [region, province, city, barangay]
    .filter(Boolean)
    .join(", ");

  const handleRegionSelect = (regionName: string) => {
    onRegionChange(regionName);
    setActiveTab("Province");
    setIsDropdownOpen(false);
  };

  const handleProvinceSelect = (provinceName: string) => {
    onProvinceChange(provinceName);
    setActiveTab("City");
  };

  const handleCitySelect = (cityName: string) => {
    onCityChange(cityName);
    setActiveTab("Barangay");
  };

  const handleBarangaySelect = (barangayName: string) => {
    onBarangayChange(barangayName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Area Selection */}
      <div>
        <label className="mb-2 block text-sm font-bold text-[#10231f]">
          Coverage Area
        </label>

        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-[#ded8cc] bg-[#fbfaf6] px-4 py-3 text-sm text-[#10231f] hover:bg-white"
          >
            <span
              className={
                selectedArea ? "text-[#10231f]" : "text-slate-400"
              }
            >
              {selectedArea || "Select Region, Province, City, Barangay"}
            </span>
            <ChevronDown className="h-4 w-4 text-[#8a938c]" />
          </div>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 bg-white border border-[#ded8cc] rounded-xl shadow-lg max-h-80 overflow-hidden">
              {/* Tabs */}
              <div className="flex bg-[#f7f7f5] p-1.5 border-b border-[#ded8cc]">
                {(["Region", "Province", "City", "Barangay"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${
                        activeTab === tab
                          ? "bg-white text-[#2f8f83] shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  )
                )}
              </div>

              {/* Options */}
              <div className="max-h-60 overflow-y-auto p-1.5">
                {activeTab === "Region" &&
                  CUSTOM_REGIONS.map((r) => (
                    <div
                      key={r.region_name}
                      onClick={() => handleRegionSelect(r.region_name)}
                      className="p-2.5 hover:bg-[#f7f7f5] rounded-lg cursor-pointer text-sm"
                    >
                      {r.region_name}
                    </div>
                  ))}

                {activeTab !== "Region" && (
                  <div className="p-4 text-center text-sm text-slate-400">
                    Select from previous step
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Radius */}
      <div>
        <label className="mb-2 block text-sm font-bold text-[#10231f]">
          Service Radius
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SERVICE_RADII.map((radius) => (
            <button
              key={radius}
              type="button"
              onClick={() => onRadiusChange(radius)}
              className={`
                rounded-xl border px-3 py-2.5 text-sm font-medium transition
                ${
                  serviceRadius === radius
                    ? "border-[#2f8f83] bg-[#2f8f83] text-white"
                    : "border-[#ded8cc] bg-white text-[#10231f] hover:border-[#2f8f83]/50"
                }
              `}
            >
              {radius}km
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Distance you can serve from your location
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="h-48 rounded-xl overflow-hidden border border-[#ded8cc] bg-[#f7f7f5] flex items-center justify-center">
        <p className="text-sm text-slate-400">Map preview coming soon</p>
      </div>
    </div>
  );
}