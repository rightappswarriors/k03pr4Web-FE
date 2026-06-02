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

  if (loading) return <div className="py-12 text-center text-slate-500">Loading top stores...</div>;

  return (
    <section className="container-shell py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-slate-900">Best Selling Stores</h2>
        <Link 
          href="/stores" 
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-[#d98b2b] hover:text-white group"
        >
          View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org, index) => {
          // Calculate counts for the badges
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
          };

          return <StoreCard key={org.id} store={storeData as any} index={index} />;
        })}
      </div>
    </section>
  );
}