"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { ApiProduct } from "@/types/api-product";
import { formatPrice } from "@/lib/utils";
import { getMediaImageUrl, PRODUCT_FALLBACK_IMAGE } from "@/lib/images";
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

  const productId = product.inventory_item_id;
  const productLinkId = product.inventory_item_id;
  const imageSrc = getMediaImageUrl(product.image, PRODUCT_FALLBACK_IMAGE);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("access");

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
        triggerFlyToCart(rect.left + rect.width / 2, rect.top + rect.height / 2);
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
      className="group block overflow-hidden rounded-[1.35rem] border border-[#ded8cc] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#2f8f83]/45 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)]"
    >
      <div className="relative h-56 w-full overflow-hidden bg-[#f3f0e8]">
        <Image
          src={imageSrc}
          alt={product.name}
          className="object-contain p-5 transition duration-500 group-hover:scale-[1.03]"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          loading="lazy"
          quality={76}
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#1f5f56]">
          Available
        </div>
      </div>

      <div className="p-4.5">
        <h3 className="text-[15px] font-black leading-tight text-[#10231f] line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-[#d98b2b] text-[#d98b2b]" />
          <span className="text-xs font-semibold text-[#66706b]">4.9</span>
          <span className="text-xs text-[#9aa39b]">(89)</span>
        </div>

        <p className="mt-2 min-h-10 text-xs leading-5 text-[#66706b] line-clamp-2">
          {product.description || "No description available yet."}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3" ref={buttonRef}>
          <div>
            <p className="text-lg font-black text-[#10231f]">
              {formatPrice(product.price)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a938c]">
              <Package className="h-3.5 w-3.5" />
              {product.quantity} in stock
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              isAnimating
                ? "bg-[#2f8f83] text-white"
                : "bg-[#10231f] text-white hover:bg-[#f97316]"
            } ${isAdding ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <ShoppingCart className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </Link>
  );
}
