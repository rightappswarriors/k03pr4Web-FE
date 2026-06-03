"use client"; // Required for Framer Motion and Embla hooks

import React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getMediaImageUrl, STORE_FALLBACK_IMAGE } from "@/lib/images";

interface StoreImageSliderProps {
  // Accepts an array of image URLs
  images: string[]; 
  alt: string;
}

export default function StoreImageSlider({ images, alt }: StoreImageSliderProps) {
  // 1. Initialize Embla with options
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true, // Infinite loop
      align: "start",
      skipSnaps: false,
    },
    // 2. Add the Autoplay plugin configuration
    [
      Autoplay({ 
        delay: 4000, // Time between slides (4 seconds)
        stopOnInteraction: false, // Keep sliding even after user clicks
        stopOnMouseEnter: true, // Pause when user hovers
      })
    ]
  );

  return (
    // 3. The main Viewport container (emblaRef connects here)
    <div className="embla overflow-hidden rounded-3xl border border-slate-100 shadow-sm" ref={emblaRef}>
      {/* 4. The Container holding the slides (flexbox) */}
      <div className="embla__container flex">
        {images.map((src, index) => (
          // 5. Individual Slide (takes up full width)
          <div className="embla__slide relative flex-[0_0_100%] min-w-0" key={index}>
            <div className="relative aspect-square w-full">
              <Image
                src={getMediaImageUrl(src, STORE_FALLBACK_IMAGE)}
                alt={`${alt} - view ${index + 1}`}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                quality={76}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
