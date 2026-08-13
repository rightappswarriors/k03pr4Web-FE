"use client";

import { Suspense } from "react";
import SearchBar from "./SearchBar";

function SearchBarSuspense() {
  return <SearchBar />;
}

export default function SearchBarWrapper() {
  return (
    <Suspense fallback={<input type="text" placeholder="Search..." className="w-full rounded-lg border border-[#b7e4d8]/20 bg-[#b7e4d8]/10 py-2.5 pl-12 pr-10 text-[13px] text-white placeholder-[#b7e4d8]/60" />}>
      <SearchBarSuspense />
    </Suspense>
  );
}