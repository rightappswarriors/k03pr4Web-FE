"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { getMediaImageUrl, PRODUCT_FALLBACK_IMAGE } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/useCart";

type CartItem = {
  id: number;
  product_id: number;
  branch_id: number | null;
  product_name: string;
  image: string | null;
  outlet_name: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

type CartResponse = {
  id: number;
  items: CartItem[];
  total_quantity: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export default function CartPage() {
  const router = useRouter();
  const setCount = useCart((state) => state.setCount);

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeButtons, setActiveButtons] = useState<
    Record<string | number, "plus" | "minus" | null>
  >({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const recalculateCart = (items: CartItem[]): CartResponse | null => {
    if (!cart) return null;

    const total_quantity = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    );

    return { ...cart, items, total_quantity, total_amount };
  };

  const clearSessionAndRedirect = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("loggedInUser");
    setCount(0);
    router.push("/login");
  }, [router, setCount]);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      localStorage.setItem("redirect_after_login", "/cart");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.status === 401) {
        clearSessionAndRedirect();
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to fetch cart.");
      }

      if (!data || !Array.isArray(data.items)) {
        throw new Error("Backend did not return a valid cart.");
      }

      setCart(data);
      setCount(data.total_quantity || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, clearSessionAndRedirect, router, setCount]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleButtonFlash = (
    itemId: string | number,
    type: "plus" | "minus"
  ) => {
    setActiveButtons((prev) => ({ ...prev, [itemId]: type }));
    setTimeout(() => {
      setActiveButtons((prev) => ({ ...prev, [itemId]: null }));
    }, 200);
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    const token = localStorage.getItem("access");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!cart) return;

    const previousCart = cart;
    const targetItem = cart.items.find((item) => item.id === itemId);

    if (!targetItem) return;

    const optimisticItems =
      newQuantity <= 0
        ? cart.items.filter((item) => item.id !== itemId)
        : cart.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: newQuantity,
                  subtotal: String(Number(item.unit_price) * newQuantity),
                }
              : item
          );

    const optimisticCart = recalculateCart(optimisticItems);

    if (optimisticCart) {
      setCart(optimisticCart);
      setCount(optimisticCart.total_quantity);
    }

    try {
      const res = await fetch(`${API_URL}/cart/item/${itemId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await res.json();

      if (res.status === 401) {
        clearSessionAndRedirect();
        return;
      }

      if (!res.ok) {
        setCart(previousCart);
        setCount(previousCart.total_quantity || 0);
        throw new Error(
          data?.error || data?.detail || "Failed to update cart item."
        );
      }

      if (data && Array.isArray(data.items)) {
        setCart(data);
        setCount(data.total_quantity || 0);
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      setCart(previousCart);
      setCount(previousCart.total_quantity || 0);
      alert(
        error instanceof Error ? error.message : "Failed to update cart item."
      );
    }
  };

  const removeItem = async (itemId: number) => {
    const token = localStorage.getItem("access");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!cart) return;

    const previousCart = cart;
    const optimisticItems = cart.items.filter((item) => item.id !== itemId);
    const optimisticCart = recalculateCart(optimisticItems);

    if (optimisticCart) {
      setCart(optimisticCart);
      setCount(optimisticCart.total_quantity);
    }

    try {
      const res = await fetch(`${API_URL}/cart/item/${itemId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.status === 401) {
        clearSessionAndRedirect();
        return;
      }

      if (!res.ok) {
        setCart(previousCart);
        setCount(previousCart.total_quantity || 0);
        throw new Error(
          data?.error || data?.detail || "Failed to remove cart item."
        );
      }

      if (data && Array.isArray(data.items)) {
        setCart(data);
        setCount(data.total_quantity || 0);
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      setCart(previousCart);
      setCount(previousCart.total_quantity || 0);
      alert(
        error instanceof Error ? error.message : "Failed to remove cart item."
      );
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal), 0);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[#f6f4ee]">
        <Header />
        <section className="container-shell flex flex-1 items-center justify-center py-24">
          <div className="w-full max-w-3xl rounded-[2rem] border border-[#ded8cc] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="h-8 w-40 animate-pulse rounded-full bg-[#e9e3d7]" />
            <div className="mt-6 grid gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-2xl bg-[#f6f4ee] p-4"
                >
                  <div className="h-24 w-24 animate-pulse rounded-2xl bg-[#e5ddce]" />
                  <div className="flex flex-1 flex-col justify-center gap-3">
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#e5ddce]" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#e5ddce]" />
                    <div className="h-8 w-32 animate-pulse rounded-full bg-[#e5ddce]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f4ee]">
        <Header />
        <section className="container-shell flex flex-col items-center justify-center py-24 text-center md:py-32">
          <div className="relative rounded-[2rem] border border-[#ded8cc] bg-white p-8 shadow-[0_24px_70px_rgba(31,95,86,0.12)]">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#de922f]/15" />
            <div className="relative rounded-3xl bg-[#f6f4ee] p-6">
              <ShoppingBag className="h-14 w-14 text-[#1f5f56]" />
            </div>
          </div>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-[#2f8f83]">
            Cart is waiting
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-[#10231f]">
            Your cart is empty
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#66706b]">
            Build your basket from verified stores and come back here when
            you&apos;re ready to choose pickup or delivery.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1f5f56] px-8 py-4 text-sm font-bold text-white shadow-[0_18px_35px_rgba(31,95,86,0.22)] transition hover:bg-[#17483f]"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f4ee]">
      <Header />
      <section className="container-shell pb-20 pt-10 md:pb-24 md:pt-12">
        <div className="flex flex-col gap-5 border-b border-[#ded8cc] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2f8f83]">
              Cart
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#10231f]">
              Shopping Cart
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66706b]">
              Review your selected products before choosing pickup or delivery at checkout.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#ded8cc] bg-white px-4 py-2 text-sm font-bold text-[#10231f]">
              {cart?.total_quantity || 0} items
            </span>
            <span className="rounded-full border border-[#ded8cc] bg-white px-4 py-2 text-sm font-bold text-[#1f5f56]">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)]">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#ded8cc] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded8cc] px-5 py-4">
              <div>
                <p className="text-sm font-black text-[#10231f]">
                  Basket review
                </p>
                <p className="text-xs text-[#66706b]">
                  {items.length} product {items.length === 1 ? "line" : "lines"} from your selected stores
                </p>
              </div>
              <Link
                href="/products"
                className="rounded-full border border-[#ded8cc] px-4 py-2 text-xs font-bold text-[#1f5f56] transition hover:border-[#1f5f56] hover:bg-[#eef6f4]"
              >
                Add more items
              </Link>
            </div>

            {items.map((item) => {
              const unitPrice = Number(item.unit_price);
              const itemTotal = Number(item.subtotal);
              const activeButton = activeButtons[item.id];
              const imageUrl = getMediaImageUrl(item.image, PRODUCT_FALLBACK_IMAGE);

              return (
                <div
                  key={item.id}
                  className="group border-b border-[#ded8cc] p-4 transition duration-300 last:border-b-0 hover:bg-[#fbfaf6] sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#f3efe7] sm:h-24 sm:w-24">
                      <Image
                        src={imageUrl}
                        alt={item.product_name}
                        fill
                        sizes="(max-width: 640px) 100vw, 112px"
                        className="object-contain p-3 transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6f4] px-2.5 py-1 text-[11px] font-bold text-[#1f5f56]">
                              <PackageCheck className="h-3 w-3" />
                              In cart
                            </span>
                            {item.outlet_name && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f4ee] px-2.5 py-1 text-[11px] font-semibold text-[#66706b]">
                                <Store className="h-3 w-3" />
                                {item.outlet_name}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 truncate text-lg font-black text-[#10231f]">
                            {item.product_name}
                          </h3>
                          <p className="mt-1 text-sm text-[#66706b]">
                            {formatPrice(unitPrice)} each
                          </p>
                        </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 lg:min-w-[260px] lg:justify-end">
                        <div className="flex w-fit items-center rounded-full border border-[#ded8cc] bg-[#fbfaf6] p-1 shadow-sm">
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) return;
                              handleButtonFlash(item.id, "minus");
                              updateQuantity(item.id, item.quantity - 1);
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-[#66706b] transition-all duration-200 hover:bg-[#de922f] hover:text-white ${
                              activeButton === "minus"
                                ? "bg-[#de922f] text-white"
                                : ""
                            } ${item.quantity <= 1 ? "cursor-not-allowed opacity-40" : ""}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="min-w-12 px-4 text-center text-sm font-black text-[#10231f]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => {
                              handleButtonFlash(item.id, "plus");
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-[#66706b] transition-all duration-200 hover:bg-[#de922f] hover:text-white ${
                              activeButton === "plus"
                                ? "bg-[#de922f] text-white"
                                : ""
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-all duration-200 hover:bg-red-50"
                          aria-label={`Remove ${item.product_name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="w-full text-left lg:w-24 lg:text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a938c]">
                            Total
                          </p>
                          <p className="mt-1 text-lg font-black text-[#10231f]">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="sticky top-24 overflow-hidden rounded-[1.75rem] border border-[#ded8cc] bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-serif text-xl font-semibold tracking-tight text-[#10231f]">
                  Order Summary
                </h2>
                <div className="rounded-2xl bg-[#f6f4ee] p-3">
                  <ShoppingBag className="h-5 w-5 text-[#1f5f56]" />
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="mt-6 flex justify-between gap-4">
                  <span className="text-[#66706b]">Subtotal</span>
                  <span className="font-black text-[#10231f]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#66706b]">Delivery / pickup</span>
                  <span className="text-right font-semibold text-[#8a938c]">
                    Calculated at checkout
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#66706b]">Cart items</span>
                  <span className="font-black text-[#10231f]">
                    {cart?.total_quantity || 0}
                  </span>
                </div>
              </div>

              <div className="my-6 h-px bg-[#ded8cc]" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-[#10231f]">Total</span>
                <span className="text-2xl font-black text-[#10231f]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="my-6 h-px bg-[#ded8cc]" />

              <div className="space-y-3 rounded-2xl bg-[#f6f4ee] p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2f8f83]" />
                  <p className="text-sm leading-5 text-[#66706b]">
                    Secure checkout with your saved customer account.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#de922f]" />
                  <p className="text-sm leading-5 text-[#66706b]">
                    Pickup and delivery options are confirmed on the next step.
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#1f5f56] py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(31,95,86,0.22)] transition-all duration-300 hover:bg-[#17483f] active:scale-[0.98]"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/products"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-[#ded8cc] py-3 text-sm font-bold text-[#1f5f56] transition hover:bg-[#eef6f4]"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
