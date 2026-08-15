"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import ProductGallery from "@/components/wholesale/ProductGallery";
import ProductSummary from "@/components/wholesale/ProductSummary";
import ProductPriceTiers from "@/components/wholesale/ProductPriceTiers";
import ProductSupplierCard from "@/components/wholesale/ProductSupplierCard";
import ShippingCard from "@/components/wholesale/ShippingCard";
import CustomizationBuilder from "@/components/wholesale/CustomizationBuilder";
import PackagingBuilder from "@/components/wholesale/PackagingBuilder";
import ShippingBuilder from "@/components/wholesale/ShippingBuilder";
import ProductActionsCard from "@/components/wholesale/ProductActionsCard";
import ProductTabs from "@/components/wholesale/ProductTabs";
import WholesaleBreadcrumb from "@/components/wholesale/WholesaleBreadcrumb";
import { wholesaleApi } from "@/services/wholesale.service";
import type { WholesaleProduct } from "@/types/wholesale";

function ProductDetailSkeleton() {
  return (
    <div className="container-shell py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="aspect-square animate-pulse rounded-xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-8 animate-pulse rounded bg-slate-200" />
          <div className="h-6 animate-pulse rounded bg-slate-200 w-3/4" />
          <div className="h-4 animate-pulse rounded bg-slate-200 w-1/2" />
        </div>
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="container-shell py-20">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Product not found</h1>
        <p className="text-slate-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <a href="/wholesale/products" className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700">
          Browse wholesale products
        </a>
      </div>
    </div>
  );
}

export default function WholesaleProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<WholesaleProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    wholesaleApi
      .getProduct(productId)
      .then((data) => {
        if (!data) {
          setError(true);
        } else {
          setProduct(data);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [productId]);

  if (error) {
    return <ProductNotFound />;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <ProductDetailSkeleton />
      </main>
    );
  }

  if (!product) {
    return notFound();
  }

  // Helper to check if packaging has actual data
  const hasPackaging = product.packaging && (
    product.packaging.sellingUnit ||
    product.packaging.packageLength ||
    product.packaging.packageWidth ||
    product.packaging.packageHeight ||
    product.packaging.packageWeight
  );

  // Helper to check if shipping info has actual data
  const hasShippingInfo = product.shippingInfo && (
    product.shippingInfo.originCountry ||
    product.shippingInfo.originProvince ||
    product.shippingInfo.originCity ||
    product.shippingInfo.estimatedDays ||
    product.shippingInfo.shippingNotes
  );
  console.log("Product: image", product)
  // Helper to check if there are customizations
  const hasCustomizations = product.customizations && product.customizations.length > 0;

  // Helper to check if there are variants
  const hasVariants = product.variants && product.variants.length > 0;

  // Helper to check if there are price tiers
  const hasPriceTiers = product.priceTiers && product.priceTiers.length > 0;

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header wholesale />

      <div className="container-shell py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <WholesaleBreadcrumb category={product.category} productName={product.name} />
        </div>

        {/* Desktop: 3-column layout (Gallery + Details | Price/Supplier | Tabs) */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Gallery + Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <ProductGallery
              images={
                product.supplierItemImage?.length
                  ? product.supplierItemImage
                  : product.images?.length
                    ? product.images
                    : product.image
                      ? [product.image]
                      : []
              }
              productName={product.name}
              variants={hasVariants ? product.variants : undefined}
            />

            {/* Product Summary */}
            <ProductSummary product={product} />
          </div>

          {/* Right Column: Price Tiers + Supplier + Actions */}
          <div className="space-y-6">
            {/* Price Tiers - only show if there are actual price tiers */}
            {hasPriceTiers && <ProductPriceTiers priceTiers={product.priceTiers} />}

            <ProductSupplierCard product={product} />
            <ShippingCard product={product} />
            <ProductActionsCard product={product} />

            {/* Packaging - only show if there is data */}
            {hasPackaging && product.packaging && <PackagingBuilder packaging={product.packaging} />}

            {/* Shipping Info - only show if there is data */}
            {hasShippingInfo && product.shippingInfo && <ShippingBuilder shipping={product.shippingInfo} />}

            {/* Customizations - only show if there are customizations */}
            {hasCustomizations && product.customizations && <CustomizationBuilder customizations={product.customizations} />}
          </div>
        </div>

        {/* Product Tabs (full width below columns) */}
        <div className="mt-8">
          <ProductTabs product={product} />
        </div>
      </div>
    </main>
  );
}