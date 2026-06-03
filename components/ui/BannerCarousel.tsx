"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { banners } from "@/data/banners";

const slides = [
  {
    eyebrow: "Kompra marketplace",
    title: "Shop local stores without the messy browsing.",
    copy: "Find real products from nearby branches, compare availability, and checkout from one clean storefront.",
    stat: "50+",
    statLabel: "partner stores",
  },
  {
    eyebrow: "Branch-ready shopping",
    title: "Pickup, delivery, and stock in one flow.",
    copy: "Browse essentials, hardware, food, and daily goods from verified sellers across active locations.",
    stat: "24h",
    statLabel: "fast updates",
  },
  {
    eyebrow: "For daily buyers",
    title: "Less noise. Better product discovery.",
    copy: "A calmer shopping experience with clear prices, store context, and practical categories.",
    stat: "0",
    statLabel: "guesswork",
  },
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const currentBanner = banners[currentIndex];
  const currentSlide = slides[currentIndex % slides.length];

  return (
    <section className="grid overflow-hidden rounded-[2rem] border border-[#ded8cc] bg-[#fbfaf6] shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
      <div className="flex min-h-[420px] flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
            {currentSlide.eyebrow}
          </p>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[0.98] tracking-tight text-[#10231f] sm:text-5xl lg:text-6xl">
            {currentSlide.title}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-[#66706b]">
            {currentSlide.copy}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 text-sm font-bold text-white transition hover:bg-[#ea580c]"
            >
              Shop products
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/stores"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#cfc8bc] bg-white px-6 text-sm font-bold text-[#10231f] transition hover:border-[#2f8f83]"
            >
              <MapPin className="h-4 w-4 text-[#2f8f83]" />
              Browse stores
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#e2ded5] bg-white p-4">
            <p className="text-3xl font-black text-[#10231f]">
              {currentSlide.stat}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7d877f]">
              {currentSlide.statLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e2ded5] bg-white p-4">
            <ShieldCheck className="h-6 w-6 text-[#2f8f83]" />
            <p className="mt-3 text-sm font-bold text-[#10231f]">
              Verified store network
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[340px] bg-[#e7e0d3] lg:min-h-[520px]">
        <Image
          src={currentBanner.image}
          alt={currentBanner.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={84}
        />
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/45 to-transparent p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            Featured aisle
          </p>
          <p className="mt-2 text-2xl font-black">{currentBanner.title}</p>
          <p className="mt-1 text-sm text-white/80">{currentBanner.subtitle}</p>
        </div>
      </div>

      <div className="col-span-full flex gap-2 border-t border-[#e5dfd5] bg-white px-6 py-4">
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              currentIndex === i ? "w-10 bg-[#2f8f83]" : "w-5 bg-[#d8d2c7]"
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
