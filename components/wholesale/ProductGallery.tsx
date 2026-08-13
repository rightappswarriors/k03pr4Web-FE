"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ProductVariant } from "@/types/wholesale";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  variants?: ProductVariant[];
  onVariantChange?: (variant: ProductVariant) => void;
};

export default function ProductGallery({ images, productName, variants, onVariantChange }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine the active variant and its images
  const hasVariants = variants && variants.length > 0;
  const defaultVariant = hasVariants ? variants.find(v => v.isDefault) || variants[0] : null;
  const activeVariant = selectedVariantId
    ? variants?.find(v => v.id === selectedVariantId)
    : defaultVariant;

  // Use variant images if available and a variant is selected, otherwise use main images
  const displayImages = activeVariant?.images && activeVariant.images.length > 0
    ? activeVariant.images
    : images;

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-slate-100 flex items-center justify-center">
        <span className="text-slate-400">No image available</span>
      </div>
    );
  }

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    setSelectedImage(0); // Reset to first image when switching variants
    onVariantChange?.(variant);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Gallery: image on top / thumbs below on mobile, thumbs left / image right on desktop */}
        <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start">
          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-shrink-0 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[500px]">
              {displayImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === index ? "border-emerald-600" : "border-transparent"
                    }`}
                >
                  <img
                    src={img}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-xl bg-white">
            <img
              src={displayImages[selectedImage]}
              alt={productName}
              className="h-full w-full cursor-zoom-in object-cover"
              onClick={() => setIsModalOpen(true)}
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute right-3 top-3 rounded-full bg-white/80 p-2 hover:bg-white"
              aria-label="Zoom image"
            >
              <ZoomIn className="size-5 text-slate-700" />
            </button>

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white lg:hidden"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5 text-slate-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white lg:hidden"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5 text-slate-700" />
                </button>
              </>
            )}
          </div>
        </div>
        {/* ^ closes the flex row div */}

        {/* Variant Selector - if variants exist */}
        {hasVariants && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            {variants.some(v => v.options.some(o => o.colorHex)) ? (
              // Color palette style selector
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Select Color:</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const colorOption = variant.options.find(o => o.colorHex);
                    const isSelected = selectedVariantId === variant.id || (!selectedVariantId && variant.isDefault);
                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${isSelected ? "border-emerald-600 scale-110" : "border-slate-300 hover:scale-105"
                          }`}
                        title={variant.name}
                      >
                        {colorOption?.colorHex ? (
                          <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: colorOption.colorHex }}
                          />
                        ) : (
                          <img
                            src={variant.image || displayImages[0]}
                            alt={variant.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Dropdown style selector for non-color variants
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Select Variant:</p>
                <select
                  value={selectedVariantId || defaultVariant?.id || ""}
                  onChange={(e) => {
                    const v = variants.find(v => v.id === e.target.value);
                    if (v) handleVariantSelect(v);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name} - ₱{variant.price}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ^ closes the outer space-y-4 div */}

      {/* Modal for zoomed view */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -right-2 -top-2 rounded-full bg-white p-2 text-slate-900"
              aria-label="Close"
            >
              ×
            </button>
            <img src={displayImages[selectedImage]} alt={productName} className="max-h-[90vh] max-w-full object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
