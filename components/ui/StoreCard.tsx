"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Store } from "lucide-react";

export default function StoreCard({
  store,
  index = 0,
  variant = "default",
}: {
  store: any;
  index?: number;
  variant?: "default" | "location";
}) {

  // ✅ EXISTING LOGIC
  const orgSlug = store.orgSlug;
  const locSlug = `${store.id}-${store.name.toLowerCase().replace(/\s+/g, "-")}`;

  // ✅ DEBUG VALUES
  const debugUrl = `/k/locations/${locSlug}?type=${store.type}&org=${orgSlug}`;

  console.log("STORE DEBUG:", {
    store,
    orgSlug,
    locSlug,
    finalUrl: debugUrl,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <Link
        href={debugUrl}
        className="group block overflow-hidden rounded-xl border border-slate-100 bg-white transition-all hover:border-[#3a9688]/30 hover:shadow-lg"
      >
        <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
          <img
            src={
              store.image ||
              "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
            }
            alt={store.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        <div className="p-5">
          <h3 className="font-serif text-xl font-bold text-slate-900 transition-colors group-hover:text-[#3a9688]">
            {store.name}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2">
            {store.description}
          </p>

          

          <div className="mt-4">
            {variant === "location" ? (
              <p className="text-sm text-slate-500">
                📍 {store.description || "No address available"}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5efe6] px-3 py-1 text-[11px] font-medium text-[#5f5646]">
                  {store.branchCount || 0} Branches
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5efe6] px-3 py-1 text-[11px] font-medium text-[#5f5646]">
                  {store.outletCount || 0} Outlets
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}