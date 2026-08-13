"use client";

import { ChevronRight, X } from "lucide-react";
import type { WholesaleCategory } from "@/types/wholesale";

export default function CategorySidebar({
  categories,
  drawer = false,
  onClose,
}: {
  categories: WholesaleCategory[];
  drawer?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside
      id="categories"
      className={
        drawer
          ? "fixed inset-y-0 left-0 z-60 w-[min(20rem,88vw)] overflow-y-auto bg-white p-5 shadow-2xl"
          : "card hidden h-[420px] overflow-hidden lg:block"
      }
      aria-label="Browse categories"
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <h2 className="font-bold text-slate-900">Browse by category</h2>
        {drawer && (
          <button
            onClick={onClose}
            aria-label="Close categories"
            className="rounded-lg p-2 hover:bg-slate-100 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="max-h-[320px] overflow-y-auto px-2">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700"
          >
            <span>{category.name}</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </a>
        ))}
      </div>
      <button className="mx-4 mt-3 w-[calc(100%-2rem)] rounded-lg border border-emerald-700 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700">
        View all categories
      </button>
    </aside>
  );
}