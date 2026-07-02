"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, Store, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type ConfirmationOrder = {
  id: number;
  transactionnumber: string;
  subtotal: number;
  total: number;
  status: string;
  outlet_name: string | null;
  order_type: "DELIVERY" | "PICKUP";
};

export default function CheckoutConfirmationPage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [orders, setOrders] = useState<ConfirmationOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("access");
      if (!token || !idsParam) {
        setLoading(false);
        return;
      }

      const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${API_URL}/orders/${id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return null;
            return res.json();
          })
        );
        setOrders(results.filter((o): o is ConfirmationOrder => o !== null));
      } catch (error) {
        console.error("Failed to fetch confirmation orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL, idsParam]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-lg text-slate-500">Loading your orders...</p>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header />

      <section className="container-shell py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf7f4]">
              <CheckCircle2 className="h-7 w-7 text-[#2f8f83]" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-brand-blue">
              Your Order Was Placed Successfully!
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Since your cart had items from {orders.length} different stores, we've
              split it into {orders.length} separate orders so each store can prepare
              and fulfill their items independently.
            </p>
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const isPickup = order.order_type === "PICKUP";
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Order Number
                      </p>
                      <p className="mt-1 text-base font-bold text-brand-blue">
                        {order.transactionnumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5">
                      {isPickup ? (
                        <Store className="h-4 w-4 text-[#2f8f83]" />
                      ) : (
                        <Truck className="h-4 w-4 text-[#2f8f83]" />
                      )}
                      <span className="text-xs font-semibold text-brand-blue">
                        {isPickup ? "Pickup" : "Delivery"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {order.outlet_name || "Store"}
                    </p>
                    <p className="text-base font-bold text-brand-blue">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <Link
                    href={`/tracking/${order.id}`}
                    className="mt-4 block w-full rounded-xl bg-[#1f5f56] py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#148a78]"
                  >
                    Track This Order
                  </Link>
                </div>
              );
            })}
          </div>

          <Link
            href="/products"
            className="block w-full rounded-2xl border border-slate-200 bg-white py-4 text-center text-lg font-semibold text-brand-blue transition hover:bg-slate-50"
          >
            Continue Shopping
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}