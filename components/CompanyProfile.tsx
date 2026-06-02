"use client";

import Image from "next/image";
import { CheckCircle2, Factory, Globe, Users } from "lucide-react";
import { getMediaImageUrl, STORE_FALLBACK_IMAGE } from "@/lib/images";

export default function CompanyProfile({
  organization,
  branchesCount,
  outletsCount,
}: {
  organization: any;
  branchesCount: number;
  outletsCount: number;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#ded8cc] bg-white">
      <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
            Company profile
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#10231f] sm:text-3xl">
            Built for reliable local commerce.
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#66706b]">
            {organization.description ||
              "We are committed to delivering high-quality products and excellent customer service."}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-[#10231f]">
            {[
              "Established organization serving customers across active locations.",
              `${branchesCount} branches and ${outletsCount} outlets available.`,
              "Customer-first service with practical quality standards.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f8f83]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 grid grid-cols-3 gap-3">
            {[
              {
                icon: Factory,
                label: "Locations",
                val: branchesCount + outletsCount,
              },
              { icon: Users, label: "Customers", val: "1000+" },
              { icon: Globe, label: "Reach", val: "Nationwide" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#ded8cc] bg-[#fbfaf6] p-4 text-center"
              >
                <item.icon className="mx-auto h-5 w-5 text-[#2f8f83]" />
                <p className="mt-2 text-sm font-black text-[#10231f]">
                  {item.val}
                </p>
                <p className="text-xs text-[#8a938c]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[280px] bg-[#e7e0d3]">
          <Image
            src={getMediaImageUrl(organization.coverImage, STORE_FALLBACK_IMAGE)}
            alt={`${organization.name} company profile`}
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            loading="lazy"
            quality={78}
          />
        </div>
      </div>
    </section>
  );
}
