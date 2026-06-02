"use client";

import Image from "next/image";
import { MapPin, PackageCheck, ShieldCheck, Store } from "lucide-react";
import { getMediaImageUrl, STORE_FALLBACK_IMAGE } from "@/lib/images";

export default function StoreHero({ organization }: any) {
  const branchCount = organization.branches?.length || 0;
  const outletCount =
    organization.branches?.reduce(
      (acc: number, branch: any) => acc + (branch.outlets?.length || 0),
      0
    ) || 0;

  return (
    <section className="bg-[#f6f4ee] py-6 md:py-8">
      <div className="container-shell">
        <div className="grid overflow-hidden rounded-[2rem] border border-[#ded8cc] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex min-h-[360px] flex-col justify-between p-6 sm:p-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7f3] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#1f5f56]">
                <ShieldCheck className="h-4 w-4" />
                Trusted supplier
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#10231f] md:text-5xl">
                {organization.name}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#66706b] md:text-base">
                {organization.description ||
                  "We provide high-quality products with trusted service across multiple locations."}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#ded8cc] bg-[#fbfaf6] p-4">
                <Store className="h-5 w-5 text-[#2f8f83]" />
                <p className="mt-3 text-2xl font-black text-[#10231f]">
                  {branchCount}
                </p>
                <p className="text-xs text-[#8a938c]">Branches</p>
              </div>
              <div className="rounded-2xl border border-[#ded8cc] bg-[#fbfaf6] p-4">
                <MapPin className="h-5 w-5 text-[#2f8f83]" />
                <p className="mt-3 text-2xl font-black text-[#10231f]">
                  {outletCount}
                </p>
                <p className="text-xs text-[#8a938c]">Outlets</p>
              </div>
              <div className="rounded-2xl border border-[#ded8cc] bg-[#fbfaf6] p-4">
                <PackageCheck className="h-5 w-5 text-[#2f8f83]" />
                <p className="mt-3 text-2xl font-black text-[#10231f]">
                  Live
                </p>
                <p className="text-xs text-[#8a938c]">Catalog</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-[#e7e0d3] lg:min-h-[460px]">
            <Image
              src={getMediaImageUrl(organization.coverImage, STORE_FALLBACK_IMAGE)}
              className="object-cover"
              alt={`${organization.name} cover`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              quality={82}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
