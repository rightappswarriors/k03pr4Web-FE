"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = () => {
    const trimmed = query.trim();

    if (!trimmed) return;

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="relative w-full">
      <Search
        size={20}
        onClick={handleSearch}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-white"
      />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="Search products, stores, categories..."
        className="
          w-full
          rounded-lg sm:rounded-xl
          border border-[#b7e4d8]/20
          bg-[#b7e4d8]/10 backdrop-blur
          py-2.5 sm:py-3
          pl-12 pr-10   /* ✅ THIS is the important fix */
          text-[13px] sm:text-sm
          text-white placeholder-[#b7e4d8]/60
          outline-none
          transition-all duration-200
          focus:border-[#b7e4d8]
          focus:outline-none focus:ring-2 focus:ring-[#2f8f83]/30
        "
      />
    </div>
  );
}