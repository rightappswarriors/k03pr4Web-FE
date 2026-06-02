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
    <div className="bg-white border-b border-gray-200">
      <div className="container-shell flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        {/* TABS */}
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative py-4 text-sm font-medium capitalize transition whitespace-nowrap
                ${
                  activeTab === tab
                    ? "text-[#2f8f83]"
                    : "text-gray-400 hover:text-gray-700"
                }
              `}
            >
              {tab}

              {/* SMOOTH UNDERLINE */}
              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#2f8f83] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

          <input
            value={search}
            onChange={(e) => {
              const value = e.target.value;

              setSearch(value); // 🔥 now this triggers backend search (from parent)

              
            }}
            placeholder="Search in this store..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2f8f83]/30"
          />
        </div>

      </div>
    </div>
  );
}