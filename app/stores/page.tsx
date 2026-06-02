"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Building2, Globe, MapPin, Store } from "lucide-react";
import type { ApiOrganization } from "@/types/api-organization";

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
    banner:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop",
    established: "Est. 2012",
    website: "www.freshmart.com",
  },
  "Green Basket": {
    description:
      "Green Basket focuses on sustainable, eco-friendly grocery shopping with zero-waste packaging and farm-to-table produce.",
    banner:
      "https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=1600&auto=format&fit=crop",
    established: "Est. 2016",
    website: "www.greenbasket.com",
  },
  "Metro Grocers": {
    description:
      "Metro Grocers is a premium supermarket chain offering international and gourmet products alongside everyday essentials.",
    banner:
      "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=1600&auto=format&fit=crop",
    established: "Est. 2008",
    website: "www.metrogrocers.com",
  },
};

export default function AllStoresPage() {
  const [organizations, setOrganizations] = useState<ApiOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API_URL}/organizations/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch organizations");
        return res.json();
      })
      .then((data) => setOrganizations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[#f6f6f3]">
        <Header />
        <section className="flex flex-1 items-center justify-center">
          <p className="text-lg text-slate-500">Loading organizations...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f6f3]">
      <Header />

      <section className="container-shell flex-1 px-4 py-8 pb-20 sm:px-5 sm:py-10 md:py-12 md:pb-24">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-3xl font-bold leading-tight text-[#172033] sm:text-4xl md:text-[42px]">
            Organizations
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Browse our partner organizations — each with multiple branches and
            outlets near you.
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {organizations.map((org) => {
            const meta = fallbackOrgMeta[org.name] || {
              description:
                "Explore branches and outlets under this organization.",
              banner:
                "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop",
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
                className="block"
              >
                <article className="overflow-hidden rounded-2xl border border-[#d9ddd9] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                  <div className="relative h-32.5 w-full overflow-hidden sm:h-40 md:h-47.5">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${meta.banner}')` }}
                    />
                    <div className="absolute inset-0 bg-white/20" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white via-white/85 to-transparent sm:h-24" />
                  </div>

                  <div className="relative -mt-7 px-4 pb-4 sm:-mt-9 sm:px-5 sm:pb-5 md:-mt-10 md:px-6 md:pb-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#d8d2c8] bg-[#f5efe6] shadow-sm sm:h-12.5 sm:w-12.5">
                        {meta.logo ? (
                          <img
                            src={meta.logo}
                            alt={org.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-serif text-base font-bold text-[#17315c] sm:text-lg">
                            {org.name?.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-1.5 sm:pt-2">
                        <h2 className="font-serif text-xl font-bold leading-tight text-[#172033] sm:text-2xl md:text-[22px]">
                          {org.name}
                        </h2>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-500 sm:mt-4 sm:text-[13px] sm:leading-6">
                      {meta.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5efe6] px-2.5 py-1 text-[10px] font-medium text-[#5f5646] sm:px-3 sm:text-[11px]">
                        <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {meta.established}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5efe6] px-2.5 py-1 text-[10px] font-medium text-[#5f5646] sm:px-3 sm:text-[11px]">
                        <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {branchCount} Branches
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5efe6] px-2.5 py-1 text-[10px] font-medium text-[#5f5646] sm:px-3 sm:text-[11px]">
                        <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {outletCount} Outlets
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5efe6] px-2.5 py-1 text-[10px] font-medium text-[#5f5646] sm:px-3 sm:text-[11px]">
                        <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="max-w-30 truncate sm:max-w-none">
                          {meta.website}
                        </span>
                      </span>
                    </div>

                    <div className="mt-4 sm:mt-5">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#177c78]">
                        View Stores & Products
                        <span className="text-base">→</span>
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}