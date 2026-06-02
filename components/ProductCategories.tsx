"use client";

import Image from "next/image";
import { getMediaImageUrl, STORE_FALLBACK_IMAGE } from "@/lib/images";

export default function ProductCategories({
  categories,
  products,
  selectedCategory,
  setSelectedCategory,
  setActiveTab,
}: any) {
  const filteredCategories = categories.filter((cat: any) =>
    products.some((p: any) => p.category_name === cat.name)
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
            Store catalog
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#10231f] sm:text-3xl">
            Product categories
          </h2>
        </div>
        <p className="text-sm font-semibold text-[#66706b]">
          {products.length} available products
        </p>
      </div>

      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((cat: any) => {
            const sample = products.find(
              (p: any) => p.category_name === cat.name
            );
            const count = products.filter(
              (p: any) => p.category_name === cat.name
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setActiveTab("products");
                }}
                className={`group overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 ${
                  selectedCategory === cat.name
                    ? "border-[#2f8f83]"
                    : "border-[#ded8cc] hover:border-[#2f8f83]/45"
                }`}
              >
                <div className="relative h-36 overflow-hidden bg-[#f3f0e8]">
                  <Image
                    src={getMediaImageUrl(sample?.image, STORE_FALLBACK_IMAGE)}
                    alt={cat.name}
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 260px"
                    loading="lazy"
                    quality={74}
                  />
                </div>

                <div className="p-4">
                  <p className="font-black text-[#10231f]">{cat.name}</p>
                  <p className="mt-1 text-sm text-[#66706b]">
                    {count} item{count > 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-8 text-center text-[#66706b]">
          No categories yet.
        </div>
      )}
    </section>
  );
}
