"use client";

import { useState } from "react";
import { MessageCircle, ShoppingCart } from "lucide-react";
import SupplierChat from "./SupplierChat";
import AddToCartModal from "./AddToCartModal";
import OrderProtectionModal from "./OrderProtectionModal";
import type { WholesaleProduct } from "@/types/wholesale";

type ProductActionsCardProps = {
  product: WholesaleProduct;
};

export default function ProductActionsCard({ product }: ProductActionsCardProps) {
  const [showChat, setShowChat] = useState(false);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [showProtection, setShowProtection] = useState(false);

  const handleStartOrder = () => {
    // For now, open the AddToCartModal in "buy now" mode
    // This would typically open a streamlined checkout flow
    setShowAddToCart(true);
  };

  return (
    <>
      <div className="rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>

        {/* Start Order - Primary action */}
        <button
          onClick={handleStartOrder}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 mb-3"
        >
          <ShoppingCart className="size-5" />
          Start Order
        </button>

        {/* Chat Now - Secondary action */}
        <button
          onClick={() => setShowChat(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 mb-3"
        >
          <MessageCircle className="size-5" />
          Chat Now
        </button>

        {/* Add to Cart - Secondary action */}
        <button
          onClick={() => setShowAddToCart(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-3 font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <ShoppingCart className="size-5" />
          Add to Cart
        </button>

        {/* Order Protection Link */}
        <button
          onClick={() => setShowProtection(true)}
          className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Order Protection
        </button>
      </div>

      <SupplierChat
        product={product}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
      <AddToCartModal
        productId={product.id}
        product={product}
        isOpen={showAddToCart}
        onClose={() => setShowAddToCart(false)}
        onSuccess={() => {
          // Could trigger cart count update in header
        }}
      />
      <OrderProtectionModal
        isOpen={showProtection}
        onClose={() => setShowProtection(false)}
      />
    </>
  );
}