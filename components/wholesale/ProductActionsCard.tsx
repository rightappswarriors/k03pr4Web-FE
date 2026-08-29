"use client";

import { useState } from "react";
import { MessageCircle, ShoppingCart, FileText, Heart, Send } from "lucide-react";
import SupplierChat from "./SupplierChat";
import AddToCartModal from "./AddToCartModal";
import OrderProtectionModal from "./OrderProtectionModal";
import RequestQuotationDrawer from "./RequestQuotationDrawer";
import type { WholesaleProduct } from "@/types/wholesale";

type ProductActionsCardProps = {
  product: WholesaleProduct;
};

type ActiveModal = "chat" | "cart" | "protection" | "rfq" | null;

export default function ProductActionsCard({ product }: ProductActionsCardProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const closeModal = () => setActiveModal(null);

  const handleStartOrder = () => {
    setActiveModal("cart");
  };

  return (
    <>
      <div className="rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>

        <button
          onClick={handleStartOrder}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 mb-3"
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
          onClick={() => setActiveModal("cart")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-3 font-medium text-emerald-700 hover:bg-emerald-100"
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