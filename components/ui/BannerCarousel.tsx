"use client";

import { useEffect, useState } from "react";
import { banners } from "@/data/banners";
import NextImage from "next/image";

const bannerBackgrounds = [
  "from-[#5aa8a2] via-[#a8b08a] to-[#d4b07a]",
  "from-[#4fa7a1] via-[#63b0ab] to-[#8bc3bc]",
  "from-[#d99a5c] via-[#e0a66b] to-[#efbf87]",
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const currentBanner = banners[currentIndex];
  const currentBg = bannerBackgrounds[currentIndex % bannerBackgrounds.length];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-linear-to-r ${currentBg} px-4 py-6 sm:px-6 sm:py-8 md:p-12 shadow-md min-h-125 sm:min-h-135 md:min-h-100 flex items-center transition-all duration-1000`}
    >
      <div className="grid w-full gap-6 md:grid-cols-2 md:gap-8 items-center">
        
        {/* Text Content */}
        <div
          key={currentIndex}
          className="animate-fade-in z-20 order-2 md:order-1 text-center md:text-left"
        >
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-white/80 uppercase tracking-[0.2em]">
            Exclusive Promo
          </p>

          <h3 className="mt-2 text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight">
            {currentBanner.title}
          </h3>

          <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-md mx-auto md:mx-0">
            {currentBanner.subtitle}
          </p>

          <button className="mt-6 md:mt-8 rounded-full bg-white text-brand-blue px-6 py-2.5 sm:px-7 sm:py-3 md:px-8 md:py-3 font-bold text-sm sm:text-base hover:scale-[1.02] transition-all active:scale-95 shadow-lg">
            Shop Now
          </button>
        </div>

        {/* Image */}
        <div className="relative h-52 sm:h-64 md:h-80 overflow-hidden rounded-xl z-10 w-full order-1 md:order-2">
          <div
            className="flex h-full transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div key={banner.id} className="relative w-full shrink-0 h-full">
                <NextImage
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority={index === 0}
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/10 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex gap-2 z-30">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentIndex === i
                ? "w-8 bg-white"
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}