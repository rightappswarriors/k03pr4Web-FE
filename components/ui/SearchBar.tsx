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
        size={18}
        onClick={handleSearch}
        className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-[#b7e4d8]"
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
        className="h-10 w-full rounded-lg border border-white/15 bg-white/8 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#b7e4d8]/55 focus:border-[#b7e4d8]/55 focus:bg-white/10"
      />
    </div>
  );
}
