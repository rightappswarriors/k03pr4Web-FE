"use client";

import { Search } from "lucide-react";

export default function StoreTabs({
  activeTab,
  setActiveTab,
  search,
  setSearch,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const tabs = ["home", "products", "locations", "about", "contact"];

  return (
    <div className="sticky top-[73px] z-40 border-b border-[#ded8cc] bg-white/95 backdrop-blur">
      <div className="container-shell flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                activeTab === tab
                  ? "bg-[#10231f] text-white"
                  : "text-[#66706b] hover:bg-[#f3f0e8] hover:text-[#10231f]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in this store..."
            className="h-11 w-full rounded-xl border border-[#ded8cc] bg-[#fbfaf6] pl-10 pr-4 text-sm text-[#10231f] outline-none transition focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10"
          />
        </div>
      </div>
    </div>
  );
}
