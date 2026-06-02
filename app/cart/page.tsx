"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
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

    return {
      ...cart,
      items,
      total_quantity,
      total_amount,
    };
  };

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      localStorage.setItem("redirect_after_login", "/cart");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("FETCH CART RESPONSE:", {
        status: res.status,
        ok: res.ok,
        data,
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("loggedInUser");
        setCount(0);
        router.push("/login");
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
  }, [API_URL, router, setCount]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleButtonFlash = (
    itemId: string | number,
    type: "plus" | "minus"
  ) => {
    setActiveButtons((prev) => ({
      ...prev,
      [itemId]: type,
    }));

    setTimeout(() => {
      setActiveButtons((prev) => ({
        ...prev,
        [itemId]: null,
      }));
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

    let optimisticItems: CartItem[];

    if (newQuantity <= 0) {
      optimisticItems = cart.items.filter((item) => item.id !== itemId);
    } else {
      optimisticItems = cart.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: String(Number(item.unit_price) * newQuantity),
            }
          : item
      );
    }

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

      console.log("UPDATE CART RESPONSE:", {
        status: res.status,
        ok: res.ok,
        data,
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("loggedInUser");
        setCount(0);
        router.push("/login");
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("REMOVE CART RESPONSE:", {
        status: res.status,
        ok: res.ok,
        data,
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("loggedInUser");
        setCount(0);
        router.push("/login");
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

  const subtotal = items.reduce((acc, item) => {
    return acc + Number(item.subtotal);
  }, 0);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />

        <section className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 text-lg">Loading cart...</p>
        </section>

      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header />
        <section className="container-shell flex flex-col items-center justify-center py-32 text-center">
          <div className="rounded-full bg-slate-50 p-6">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-slate-500">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href="/products"
            className="mt-8 rounded-lg bg-[#3a9688] px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
          >
            Start Shopping
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header />
      <section className="container-shell pt-12 pb-20 md:pb-24">
        <h1 className="font-serif text-3xl font-bold text-brand-blue">
          Shopping Cart
        </h1>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => {
              const unitPrice = Number(item.unit_price);
              const itemTotal = Number(item.subtotal);
              const activeButton = activeButtons[item.id];

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                    <img
                      src={item.image || "/img/green_logo.png"}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-slate-400">{item.outlet_name}</p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatPrice(unitPrice)}
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#3a9688]">
                        Total: {formatPrice(itemTotal)}
                      </p>
                    </div>

                    <div className="mt-3 flex w-fit items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                      <button
                          onClick={() => {
                            if (item.quantity <= 1) return; // ✅ prevent delete
                            handleButtonFlash(item.id, "minus");
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-all duration-200 hover:bg-[#de922f] hover:text-white ${
                          activeButton === "minus"
                            ? "bg-[#de922f] text-white"
                            : ""
                        }`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="px-4 text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => {
                          handleButtonFlash(item.id, "plus");
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-all duration-200 hover:bg-[#de922f] hover:text-white ${
                          activeButton === "plus"
                            ? "bg-[#de922f] text-white"
                            : ""
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end pb-1">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-red-500 transition-all duration-200 hover:bg-[#de922f] hover:text-white"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-brand-blue">
              Order Summary
            </h2>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span className="font-medium">Delivery/Pickup</span>
                <span className="font-medium text-slate-400">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                  Total
                </span>
                <span className="text-xl font-semibold text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex w-full items-center justify-center rounded-xl bg-[#1f5f56] py-4 font-semibold text-white transition-all duration-300 hover:bg-[#2f7f73] active:scale-[0.98]"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}