"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  ChevronLeft,
  ShoppingCart,
  MapPin,
  Minus,
  Plus,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/useCart";
import { useAnimationStore } from "@/store/useAnimationStore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ApiProduct } from "@/types/api-product";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const setCount = useCart((state) => state.setCount);
  const triggerFlyToCart = useAnimationStore(
    (state) => state.triggerFlyToCart
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_BASE_URL = API_URL?.replace("/api", "") || "";

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}/`);
        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.status}`);
        }

        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (API_URL) {
      loadProduct();
    }
  }, [API_URL, id]);

  const increment = () => {
    if (product && quantity < product.quantity) {
      setQuantity((q) => q + 1);
    }
  };

  const decrement = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return "/img/green_logo.png";
    if (image.startsWith("http")) return image;
    return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const handleAddToCartWithAnimation = async () => {
    if (!product || isAddingToCart) return;

    const token = localStorage.getItem("access");

    if (!token) {
      localStorage.setItem(
        "redirect_after_login",
        `/product/${product.inventory_item_id}`
      );
      router.push("/login");
      return;
    }

    try {
      setIsAddingToCart(true);

      if (addToCartButtonRef.current) {
        const rect = addToCartButtonRef.current.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        triggerFlyToCart(startX, startY);
      }

      const res = await fetch(`${API_URL}/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.inventory_item_id,
          quantity: quantity,
          branch_id: product.outlet_id ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to add to cart.");
      }

      const totalCount = Array.isArray(data.items)
        ? data.items.reduce(
            (sum: number, item: { quantity: number }) =>
              sum + Number(item.quantity || 0),
            0
          )
        : 0;

      setCount(totalCount);
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error instanceof Error ? error.message : "Failed to add to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-slate-500 text-lg">Loading product...</p>
        </div>

        
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-slate-500 text-lg">Product not found</p>
        </div>

        
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
      <Header />

      <section className="flex-1 container-shell py-7">
        <Link
          href="/products"
          className="mb-6 flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-brand-blue"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>

        <div className="grid items-start gap-10 md:grid-cols-2">
          <div className="flex justify-center">
            <div className="w-full max-w-95 overflow-hidden rounded-2xl bg-[#fce4ec] shadow-sm md:max-w-105">
              <div className="relative aspect-square">
                <Image
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  priority
                  quality={82}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {product.category || "Uncategorized"}
            </p>

            <h1 className="mt-2 text-3xl font-serif font-bold tracking-tight text-brand-blue md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-2xl font-semibold text-slate-900 md:text-3xl">
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Stock available: {product.quantity}
            </p>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600">
              {product.description || "No description available."}
            </p>

            <div className="mt-7 flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-900">
                Quantity
              </span>

              <div className="flex items-center rounded-md border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={decrement}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-[#de922f] hover:text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="px-4 text-sm font-semibold text-slate-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increment}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-[#de922f] hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <motion.button
                ref={addToCartButtonRef}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCartWithAnimation}
                disabled={isAddingToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#3a9688] py-3.5 text-sm font-semibold text-white hover:bg-[#2d7a6e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingCart className="h-5 w-5" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  const token = localStorage.getItem("access");

                  if (!token) {
                    localStorage.setItem(
                      "redirect_after_login",
                      `/product/${product.inventory_item_id}`
                    );
                    router.push("/login");
                    return;
                  }

                  router.push(
                    `/checkout?directBuy=true&productId=${product.inventory_item_id}&qty=${quantity}`
                  );
                }}
                className="flex flex-1 items-center justify-center rounded-md bg-[#faf3e8] py-3.5 text-sm font-medium text-[#8a5a2b] hover:bg-[#f5ebd8]"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Sold by
              </p>

              <p className="mt-1 text-lg font-semibold text-brand-blue">
                {product.outlet_name}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                {product.outlet_address}
              </p>

              <Link
                href={`/store/${product.outlet_id}`}
                className="mt-3 flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <MapPin className="h-4 w-4 text-slate-700" />
                View Store Location
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
