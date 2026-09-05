"use client";

import { useState } from "react";
import { MessageCircle, ShoppingCart, FileText, Heart, Send } from "lucide-react";
import SupplierChat from "./SupplierChat";
import AddToCartModal from "./AddToCartModal";
import OrderProtectionModal from "./OrderProtectionModal";
import RequestQuotationDrawer from "./RequestQuotationDrawer";
import type { WholesaleProduct, ProductVariant } from "@/types/wholesale";

type ProductActionsCardProps = {
  product: WholesaleProduct;
  selectedVariant?: ProductVariant | null;
  hasVariants?: boolean;
};

type ActiveModal = "chat" | "cart" | "protection" | "rfq" | null;

export default function ProductActionsCard({ product, selectedVariant, hasVariants }: ProductActionsCardProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const closeModal = () => setActiveModal(null);
  // Buyer must have an actual selection before ordering when the product
  // has variants and none is auto-selected via isDefault — prevents
  // accidentally ordering the base SKU or the wrong variant.
  const requiresSelection = Boolean(hasVariants) && !selectedVariant;

  const handleStartOrder = () => {
    if (requiresSelection) return;
    setActiveModal("cart");
  };
  const handleAddToCart = () => {
    if (requiresSelection) return;
    setActiveModal("cart");
  };

  return (
    <>
      <div className="rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        {requiresSelection && (
          <p className="mb-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Please select an option above before ordering.
          </p>
        )}

        <button
          onClick={handleStartOrder}
          disabled={requiresSelection}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="size-5" />
          Start Order
        </button>

        <button
          onClick={() => setActiveModal("rfq")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 mb-3"
        >
          <FileText className="size-5" />
          Request Quotation
        </button>

        <button
          onClick={() => setActiveModal("chat")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 mb-3"
        >
          <MessageCircle className="size-5" />
          Chat Now
        </button>

        <button
          onClick={handleAddToCart}
          disabled={requiresSelection}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-3 font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="size-5" />
          Add to Cart
        </button>

        <button
          onClick={() => setActiveModal("protection")}
          className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Order Protection
        </button>
      </div>

      <SupplierChat
        product={product}
        isOpen={activeModal === "chat"}
        onClose={closeModal}
      />
      <AddToCartModal
        productId={product.id}
        product={product}
        initialVariantId={selectedVariant?.id}
        isOpen={activeModal === "cart"}
        onClose={closeModal}
        onOpenProtection={() => setActiveModal("protection")}
        onSuccess={() => {
          // Could trigger cart count update in header
        }}
      />
      <OrderProtectionModal
        isOpen={activeModal === "protection"}
        onClose={closeModal}
      />
      <RequestQuotationDrawer
        product={product}
        isOpen={activeModal === "rfq"}
        onClose={closeModal}
      />
    </>
  );
}