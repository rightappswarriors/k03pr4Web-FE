"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StoreCard from "@/components/ui/StoreCard";
import type { ApiOrganization } from "@/types/api-organization";

const fallbackDescriptions: Record<string, string> = {
  FreshMart: "FreshMart is a leading grocery organization committed to delivering fresh, organic, and locally-sourced...",
  "Green Basket": "Green Basket focuses on sustainable, eco-friendly grocery shopping with zero-waste packaging and...",
  "Metro Grocers": "Metro Grocers is a premium supermarket chain offering international and gourmet products alongside everyday...",
};

export default function FeaturedStores() {
  const [organizations, setOrganizations] = useState<ApiOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API_URL}/organizations/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch organizations");
        return res.json();
      })
      .then((data) => {
        setOrganizations(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch((err) => console.error("FEATURED_STORES_ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[#ded8cc] bg-white p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">Loading top stores...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
            Stores
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#10231f] sm:text-3xl">
            Best selling stores
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#66706b]">
            Trusted sellers with active branches and products ready to browse.
          </p>
        </div>

        <Link
          href="/stores"
          className="group inline-flex items-center gap-2 text-sm font-bold text-[#1f5f56] transition hover:text-[#f97316]"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org, index) => {
          const branchCount = org.total_branches ?? org.branches?.length ?? 0;
          const outletCount = org.total_outlets ?? org.branches?.reduce(
            (total, branch) => total + (branch.outlets?.length || 0),
            0
          ) ?? 0;

          const storeData = {
            id: org.id,
            name: org.name,
            description: fallbackDescriptions[org.name] || "Explore our wide range of fresh products and local branches.",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
            branchCount: branchCount,
            outletCount: outletCount,
            type: "branch",
            orgSlug: org.name.toLowerCase().replace(/\s+/g, "-"),
          };

          return <StoreCard key={org.id} store={storeData as any} index={index} />;
        })}
      </div>
    </section>
  );
}
