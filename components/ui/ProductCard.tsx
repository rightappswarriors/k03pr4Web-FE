"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { ApiProduct } from "@/types/api-product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/useCart";
import { useAnimationStore } from "@/store/useAnimationStore";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: ApiProduct }) {
  const count = useCart((state) => state.count);
  const setCount = useCart((state) => state.setCount);
  const triggerFlyToCart = useAnimationStore((state) => state.triggerFlyToCart);

  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_BASE_URL = API_URL?.replace("/api", "") || "";

  const productId = product.inventory_item_id;
  const productLinkId = product.inventory_item_id;

  const SUPABASE_BASE_URL =
    "https://khdoeyvmsvszpmmcwzrt.supabase.co/storage/v1/object/public/media";

  const getImageUrl = (image: string | null) => {
    if (!image) return "/img/green_logo.png";

    if (image.startsWith("http")) return image;

    return `${SUPABASE_BASE_URL}/${image}`;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("access");

    console.log("PRODUCT CARD ADD TO CART DEBUG:", {
      fullProduct: product,
      sentInventoryItemId: product.inventory_item_id,
      sentProductId: product.product_id,
      sentBranchId: product.outlet_id ?? null,
    });

    if (!token) {
      localStorage.setItem("redirect_after_login", `/product/${productLinkId}`);
      router.push("/login");
      return;
    }

    const previousCount = count;

    try {
      setIsAdding(true);

      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        triggerFlyToCart(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
      }

      setCount(previousCount + 1);

      const res = await fetch(`${API_URL}/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          branch_id: product.outlet_id ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCount(previousCount);
        throw new Error(data?.error || "Failed to add to cart.");
      }

      const totalCount =
        typeof data.total_quantity === "number"
          ? data.total_quantity
          : Array.isArray(data.items)
          ? data.items.reduce(
              (sum: number, item: { quantity: number }) =>
                sum + Number(item.quantity || 0),
              0
            )
          : previousCount + 1;

      setCount(totalCount);

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    } catch (error) {
      console.error("Add to cart error:", error);
      setCount(previousCount);
      alert(error instanceof Error ? error.message : "Failed to add to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      href={`/product/${productLinkId}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      
      {/* IMAGE (shorter height instead of square) */}
      <div className="relative w-full h-40 sm:h-44 md:h-48 bg-[#f8fafc] overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/img/green_logo.png";
          }}
        />
      </div>

      <div className="p-2 sm:p-2.5">
        {/* Product Name */}
        <h3 className="text-[13px] sm:text-sm font-semibold text-[#2f8f83] line-clamp-1">
          {product.name}
        </h3>

        {/* ⭐ Rating */}
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[#de922f] text-[#de922f]" />
          <span className="text-[10px] sm:text-[11px] text-slate-600">4.9</span>
          <span className="text-[10px] text-slate-400">(89)</span>
        </div>

        {/* Description */}
        <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
          {product.description || "No description"}
        </p>

        {/* Bottom Row */}
        <div className="mt-2 flex items-center justify-between" ref={buttonRef}>
          <div>
            <p className="text-sm sm:text-base font-bold text-slate-900">
              {formatPrice(product.price)}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Stock: {product.quantity}
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex h-9 w-9 items-center justify-center rounded-full border ${
              isAnimating
                ? "bg-[#2f8f83] text-white"
                : "bg-white text-slate-500 hover:bg-[#de922f] hover:text-white"
            } ${isAdding ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <ShoppingCart className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </Link>
  );
}