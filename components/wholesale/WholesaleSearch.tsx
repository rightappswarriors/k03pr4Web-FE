"use client";

import { useState, type FormEvent } from "react";
import { Camera, Search } from "lucide-react";

export function WholesaleSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      document.getElementById("recommended-products")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={onSubmit} className={compact ? "w-full" : "w-full max-w-2xl"} role="search">
      <label className="sr-only" htmlFor="wholesale-search">Search wholesale products</label>
      <div className="flex rounded-xl bg-white p-1.5 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-800/20 sm:p-2">
        <Search className="ml-2 mt-3 size-5 shrink-0 text-slate-500" aria-hidden="true" />
        <input
          id="wholesale-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search wholesale products, suppliers, categories..."
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
          aria-label="Search products"
        />
        <button
          type="button"
          aria-label="Search by image"
          className="hidden rounded-lg px-3 text-emerald-800 hover:bg-emerald-50 sm:inline-flex"
        >
          <Camera className="size-5" />
          <span className="ml-2 text-xs font-semibold">Image Search</span>
        </button>
        <button className="btn-primary rounded-lg px-4 py-2 text-sm sm:px-6">Search</button>
      </div>
    </form>
  );
}