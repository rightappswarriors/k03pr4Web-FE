"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getMediaImageUrl, STORE_FALLBACK_IMAGE } from "@/lib/images";

export default function StoreCard({
  store,
  index = 0,
  variant = "default",
}: {
  store: any;
  index?: number;
  variant?: "default" | "location";
}) {
  const orgSlug = store.orgSlug;
  const locSlug = `${store.id}-${store.name.toLowerCase().replace(/\s+/g, "-")}`;
  const href = `/k/locations/${locSlug}?type=${store.type}&org=${orgSlug}`;
  const imageSrc = getMediaImageUrl(store.image, STORE_FALLBACK_IMAGE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group block overflow-hidden rounded-2xl border border-[#ded8cc] bg-white transition hover:-translate-y-0.5 hover:border-[#2f8f83]/45"
      >
        <div className="relative aspect-16/10 overflow-hidden bg-[#e7e0d3]">
          <Image
            src={imageSrc}
            alt={store.name}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            loading={index === 0 ? "eager" : "lazy"}
            priority={index === 0}
            quality={76}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-black tracking-tight text-[#10231f]">
              {store.name}
            </h3>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#8a938c] transition group-hover:text-[#2f8f83]" />
          </div>

          <p className="mt-2 text-sm leading-6 text-[#66706b] line-clamp-2">
            {store.description}
          </p>

          <div className="mt-4">
            {variant === "location" ? (
              <p className="inline-flex items-center gap-2 text-sm text-[#66706b]">
                <MapPin className="h-4 w-4 text-[#2f8f83]" />
                {store.description || "No address available"}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f3f0e8] px-3 py-1 text-xs font-bold text-[#5f665f]">
                  {store.branchCount || 0} branches
                </span>
                <span className="rounded-full bg-[#f3f0e8] px-3 py-1 text-xs font-bold text-[#5f665f]">
                  {store.outletCount || 0} outlets
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
