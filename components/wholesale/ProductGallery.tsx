"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { formatProductPrice } from "@/lib/utils";
import type { ProductVariant } from "@/types/wholesale";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  variants?: ProductVariant[];
  selectedVariantId?: string;
  onVariantChange?: (variant: ProductVariant) => void;
};

export default function ProductGallery({ images, productName, variants, selectedVariantId, onVariantChange }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasVariants = variants && variants.length > 0;
  const defaultVariant = hasVariants ? variants.find(v => v.isDefault) || variants[0] : null;
  const activeVariant = selectedVariantId
    ? variants?.find(v => v.id === selectedVariantId)
    : defaultVariant;

  // Derive attribute groups (e.g. "Color", "Size") and their available
  // option values from the variants themselves — no separate API call
  // needed, since each variant already carries its own {group, value} pairs.
  const attributeGroups = useMemo(() => {
    if (!hasVariants) return [];
    const groupMap = new Map<string, { value: string; colorHex?: string }[]>();
    for (const variant of variants) {
      for (const opt of variant.options) {
        const existing = groupMap.get(opt.group) ?? [];
        if (!existing.some(o => o.value === opt.value)) {
          existing.push({ value: opt.value, colorHex: opt.colorHex });
        }
        groupMap.set(opt.group, existing);
      }
    }
    return Array.from(groupMap.entries()).map(([group, options]) => ({ group, options }));
  }, [hasVariants, variants]);

  // One selected value per attribute group — e.g. { Color: "Red", Size: "Large" }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Seed selections from the currently active variant whenever it changes
  // (covers both the initial default-variant load and external changes to
  // selectedVariantId from the parent page).
  useEffect(() => {
    if (!activeVariant) return;
    const next: Record<string, string> = {};
    for (const opt of activeVariant.options) {
      next[opt.group] = opt.value;
    }
    setSelectedOptions(next);
  }, [activeVariant?.id]);

  // Resolve which single variant matches the current combination of
  // selected options across every group, if any.
  const resolveVariantFromOptions = (options: Record<string, string>) => {
    if (!hasVariants) return undefined;
    return variants.find(v =>
      attributeGroups.every(g => {
        const selected = options[g.group];
        if (!selected) return false;
        return v.options.some(o => o.group === g.group && o.value === selected);
      })
    );
  };

  const handleAttributeSelect = (group: string, value: string) => {
    const nextOptions = { ...selectedOptions, [group]: value };
    setSelectedOptions(nextOptions);
    const resolved = resolveVariantFromOptions(nextOptions);
    if (resolved) {
      setSelectedImage(0);
      onVariantChange?.(resolved);
    }
    // If no variant matches this combination (e.g. "Blue + XL" doesn't
    // exist), we intentionally don't call onVariantChange — the parent's
    // selectedVariant stays whatever it was, and ProductActionsCard's
    // "please select an option" gating will not fire since a variant WAS
    // previously selected; consider surfacing a "combination unavailable"
    // message here if that's confusing in practice.
  };

  // Image fallback chain per Task C requirement 5: variant.image first
  // (single hero shot), then the variant's full image gallery, then the
  // base product images.
  const FALLBACK_IMAGE = "https://placehold.co/600x600?text=No+Image";

  const displayImages = activeVariant?.image
    ? [activeVariant.image, ...(activeVariant.images?.filter(img => img !== activeVariant.image) ?? [])]
    : activeVariant?.images && activeVariant.images.length > 0
      ? activeVariant.images
      : images && images.length > 0
        ? images
        : [FALLBACK_IMAGE];

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start">
          {/* Thumbnails — object-cover kept as-is, fine for uniformity */}
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

          {/* Main Image — object-contain + backdrop so full product isn't cropped/zoomed */}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-xl bg-white">
            {displayImages[selectedImage] === FALLBACK_IMAGE ? (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <span className="text-slate-400">No image available</span>
              </div>
            ) : (
              <img
                src={displayImages[selectedImage]}
                alt={productName}
                className="h-full w-full cursor-zoom-in bg-slate-50 object-contain"
                onClick={() => setIsModalOpen(true)}
              />
            )}
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

        {/* Variant Selector - if variants exist */}
        {hasVariants && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="space-y-4">
              {attributeGroups.map(({ group, options }) => {
                const isColorGroup = options.some(o => o.colorHex);
                return (
                  <div key={group} className="space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {group}
                      {selectedOptions[group] && (
                        <span className="ml-1 font-normal text-slate-500">— {selectedOptions[group]}</span>
                      )}
                    </p>
                    {isColorGroup ? (
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt) => {
                          const isSelected = selectedOptions[group] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleAttributeSelect(group, opt.value)}
                              className={`relative w-7 h-7 rounded-full border-2 transition-all ${isSelected ? "border-emerald-600 scale-110" : "border-slate-300 hover:scale-105"
                                }`}
                              title={opt.value}
                            >
                              <div
                                className="w-full h-full rounded-full"
                                style={{ backgroundColor: opt.colorHex }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <select
                        value={selectedOptions[group] ?? ""}
                        onChange={(e) => handleAttributeSelect(group, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="" disabled>Choose {group.toLowerCase()}...</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.value}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal for zoomed view — already correct, unchanged */}
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