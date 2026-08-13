"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Globe,
  MapPin,
  Search,
  Store,
} from "lucide-react";
import type { ApiOrganization } from "@/types/api-organization";

const fallbackBanners = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=1200&auto=format&fit=crop",
];

const fallbackOrgMeta: Record<
  string,
  {
    description: string;
    banner: string;
    logo?: string;
    established?: string;
    website?: string;
  }
> = {
  FreshMart: {
    description:
      "FreshMart is a leading grocery organization committed to delivering fresh, organic, and locally-sourced products across multiple branches and outlets.",
    banner: fallbackBanners[0],
    established: "Est. 2012",
    website: "www.freshmart.com",
  },
  "Green Basket": {
    description:
      "Green Basket focuses on sustainable, eco-friendly grocery shopping with zero-waste packaging and farm-to-table produce.",
    banner: fallbackBanners[1],
    established: "Est. 2016",
    website: "www.greenbasket.com",
  },
  "Metro Grocers": {
    description:
      "Metro Grocers is a premium supermarket chain offering international and gourmet products alongside everyday essentials.",
    banner: fallbackBanners[2],
    established: "Est. 2008",
    website: "www.metrogrocers.com",
  },
};

export default function AllStoresPage() {
  const [organizations, setOrganizations] = useState<ApiOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API_URL}/organizations/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch organizations");
        return res.json();
      })
      .then((data) => setOrganizations(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    return organizations.reduce(
      (acc, org) => {
        const branches = org.total_branches ?? org.branches?.length ?? 0;
        const outlets =
          org.total_outlets ??
          org.branches?.reduce(
            (total, branch) => total + (branch.outlets?.length || 0),
            0
          ) ??
          0;

        return {
          branches: acc.branches + branches,
          outlets: acc.outlets + outlets,
        };
      },
      { branches: 0, outlets: 0 }
    );
  }, [organizations]);

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[#f6f4ee]">
        <Header />
        <section className="flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-[#ded8cc] bg-white px-6 py-5 text-center">
            <p className="text-sm font-bold text-[#66706b]">
              Loading organizations...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f4ee]">
      <Header />

      <section className="container-shell flex-1 py-8 md:py-10">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-[#ded8cc] bg-[#10231f] text-white">
          <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b7e4d8]">
                Store directory
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                Browse partner organizations and their active locations.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                Discover verified sellers, branch networks, and outlets where
                products are available for pickup or delivery.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 self-end">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <Building2 className="h-5 w-5 text-[#b7e4d8]" />
                <p className="mt-3 text-2xl font-black">
                  {organizations.length}
                </p>
                <p className="text-xs text-white/60">Organizations</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <MapPin className="h-5 w-5 text-[#b7e4d8]" />
                <p className="mt-3 text-2xl font-black">{summary.branches}</p>
                <p className="text-xs text-white/60">Branches</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <Store className="h-5 w-5 text-[#b7e4d8]" />
                <p className="mt-3 text-2xl font-black">{summary.outlets}</p>
                <p className="text-xs text-white/60">Outlets</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-7 rounded-[1.5rem] border border-[#ded8cc] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a938c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#ded8cc] bg-[#fbfaf6] pl-12 pr-4 text-sm text-[#10231f] outline-none transition placeholder:text-[#8a938c] focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10"
              placeholder="Search organizations..."
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-[#66706b]">
          <p>
            Showing{" "}
            <span className="font-bold text-[#10231f]">
              {filteredOrganizations.length}
            </span>{" "}
            organizations
          </p>
          <p className="hidden sm:block">Verified partner network</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrganizations.map((org, index) => {
            const meta = fallbackOrgMeta[org.name] || {
              description:
                "Explore branches and outlets under this organization.",
              banner: fallbackBanners[index % fallbackBanners.length],
              established: "Est. 2020",
              website: "www.organization.com",
            };

            const branchCount =
              org.total_branches ?? org.branches?.length ?? 0;

            const outletCount =
              org.total_outlets ??
              org.branches?.reduce(
                (total, branch) => total + (branch.outlets?.length || 0),
                0
              ) ??
              0;

            return (
              <Link
                key={org.id}
                href={`/k/${org.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group overflow-hidden rounded-[1.5rem] border border-[#ded8cc] bg-white transition hover:-translate-y-1 hover:border-[#2f8f83]/45 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)]"
              >
                <article>
                  <div className="relative h-44 overflow-hidden bg-[#e7e0d3]">
                    <Image
                      src={meta.banner}
                      alt={`${org.name} banner`}
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      quality={76}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/45 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#1f5f56]">
                      Partner
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ded8cc] bg-[#f3f0e8]">
                          {meta.logo ? (
                            <Image
                              src={meta.logo}
                              alt={org.name}
                              className="object-cover"
                              fill
                              sizes="48px"
                              quality={70}
                            />
                          ) : (
                            <span className="text-base font-black text-[#10231f]">
                              {org.name?.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-xl font-black tracking-tight text-[#10231f]">
                            {org.name}
                          </h2>
                          <p className="mt-1 text-xs font-semibold text-[#8a938c]">
                            {meta.established}
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#8a938c] transition group-hover:text-[#2f8f83]" />
                    </div>

                    <p className="mt-4 min-h-12 text-sm leading-6 text-[#66706b] line-clamp-2">
                      {meta.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f0e8] px-3 py-1.5 text-xs font-bold text-[#5f665f]">
                        <MapPin className="h-3.5 w-3.5" />
                        {branchCount} branches
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f0e8] px-3 py-1.5 text-xs font-bold text-[#5f665f]">
                        <Store className="h-3.5 w-3.5" />
                        {outletCount} outlets
                      </span>

                      <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#f3f0e8] px-3 py-1.5 text-xs font-bold text-[#5f665f]">
                        <Globe className="h-3.5 w-3.5" />
                        <span className="max-w-30 truncate">{meta.website}</span>
                      </span>
                    </div>

                    <div className="mt-5 text-sm font-bold text-[#1f5f56]">
                      View stores and products
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {filteredOrganizations.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-lg font-bold text-[#10231f]">
              No organizations found
            </p>
            <p className="mt-2 text-[#66706b]">
              Try searching with another store or organization name.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
