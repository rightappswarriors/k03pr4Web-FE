"use client";

import type { ReactNode } from "react";

export default function CategoryChip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700 ${
        active
          ? "border-emerald-800 bg-emerald-800 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-700"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}