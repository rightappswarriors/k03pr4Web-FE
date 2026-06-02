"use client";

import React, { use, useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DeliveryStatusCard from "@/components/ui/DeliveryStatusCard";
import OrderProgressTracker from "@/components/ui/OrderProgressTracker";
import RiderAssignedCard from "@/components/ui/RiderAssignedCard";
import {
  Copy,
  Truck,
  Clock3,
  Store,
  Package,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

type OrderItem = {
  id: number;
  itemid: number;
  product_name: string;
  quantity: number;
  pricesnapshot: number;
  subtotal: number;
};

type TrackingItem = {
  id: number;
  event: string;
  statusat: string;
  currentlat: number | null;
  currentlng: number | null;
  note: string | null;
  actortype: string | null;
  actorid: number | null;
};

type ApiOrder = {
  id: number;
  transactionnumber: string;
  subtotal: number;
  total: number;
  status: string;
  paymentmethod: string;
  paymentstatus: string;
  customernote: string;
  createdat: string;
  items: OrderItem[];
  tracking: TrackingItem[];
  outlet_name: string | null;
  delivery_address: string | null;
  order_type: "DELIVERY" | "PICKUP";
  current_step: number;
  delivery_fee: number;
};

export default function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/orders/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch order: ${res.status} - ${text}`);
        }

        const data = await res.json();
        console.log("TRACKING ORDER RESPONSE:", data);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch tracking order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [API_URL, id]);

  const handleCopy = async () => {
    if (!order?.transactionnumber) return;
    try {
      await navigator.clipboard.writeText(order.transactionnumber);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch (error) {
      console.error("Failed to copy order number:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading order tracking...</p>
        </div>
        
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header />
        <section className="container-shell py-20 text-center">
          <h2 className="text-2xl font-bold text-brand-blue">Order not found</h2>
          <p className="mt-2 text-slate-500">
            We could not load this tracking record.
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-block rounded-xl bg-[#2f8f83] px-6 py-3 text-white hover:bg-[#26776d]"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const normalizedOrderType = String(order.order_type || "").toLowerCase();
  const isPickup =
    normalizedOrderType === "pickup" ||
    (!normalizedOrderType && !order.delivery_address);

  const deliveryFee = isPickup ? 0 : Number(order.delivery_fee || 0);

  const pickupSteps = [
    { label: "Preparing Item", subtext: "In progress..." },
    { label: "Ready for Pickup", subtext: "Awaiting customer pickup" },
    { label: "Picked Up", subtext: "Order completed" },
  ];


  const getPaymentLabel = (method: string) => {
    const m = method.toLowerCase();
    if (m === "cash_on_delivery" || m === "pay_in_pickup" || m.includes("cash")) {
      return isPickup ? "Pay in Pickup" : "Cash on Delivery";
    }
    if (m === "e-wallet") return "E-Wallet";
    return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };


  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header />

      <section className="container-shell py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf7f4]">
              <CheckCircle2 className="h-7 w-7 text-[#2f8f83]" />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-brand-blue">
              Order Placed Successfully!
            </h2>

            <p className="mt-1 text-sm text-slate-500">Thank you for your order</p>
          </div>

          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Order Number
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <h1 className="text-lg font-bold text-brand-blue sm:text-xl">
                    {order.transactionnumber}
                  </h1>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  {copySuccess && (
                    <span className="text-xs font-medium text-[#2f8f83]">Copied</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Order Type
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {isPickup ? (
                    <Store className="h-4 w-4 text-[#2f8f83]" />
                  ) : (
                    <Truck className="h-4 w-4 text-[#2f8f83]" />
                  )}

                  <p className="text-sm font-semibold text-brand-blue">
                    {isPickup ? "Pickup" : "Delivery"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Assigned Store
                </p>

                <p className="mt-2 text-sm font-semibold text-brand-blue">
                  {order.outlet_name || "Not assigned"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Ordered At
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#2f8f83]" />
                  <p className="text-sm font-semibold text-brand-blue">
                    {new Date(order.createdat).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl">
            <DeliveryStatusCard status={order.status} />
          </div>

          {isPickup ? (
            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-brand-blue">Pickup Progress</h3>

              <div className="relative mt-8 grid grid-cols-3">
                {pickupSteps.map((step, index) => {
                  const stepNumber = index + 1;
                  const isActive = order.current_step === stepNumber;
                  const isDone = order.current_step > stepNumber;
                  const isLast = index === pickupSteps.length - 1;

                  return (
                    <div key={step.label} className="relative flex flex-col items-center text-center">
                      {!isLast && (
                        <div className="absolute left-1/2 top-5 h-0.5 w-full">
                          <div
                            className={`ml-5 h-full w-[calc(100%-2.5rem)] ${
                              isDone ? "bg-[#2f8f83]" : "bg-slate-300"
                            }`}
                          />
                        </div>
                      )}

                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white ${
                          isActive || isDone
                            ? "border-[#2f8f83] text-[#2f8f83]"
                            : "border-slate-300 text-slate-400"
                        }`}
                      >
                        {stepNumber === 1 && <Package className="h-4 w-4" />}
                        {stepNumber === 2 && <Clock3 className="h-4 w-4" />}
                        {stepNumber === 3 && <Store className="h-4 w-4" />}
                      </div>

                      <p
                        className={`mt-4 text-sm font-semibold leading-5 ${
                          isActive || isDone ? "text-[#2f8f83]" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>

                      <p className="mt-1 max-w-40 text-xs leading-5 text-slate-400">
                        {step.subtext}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto w-full max-w-3xl">
                <OrderProgressTracker currentStep={order.current_step} />
              </div>

              <div className="mx-auto w-full max-w-3xl">
                <RiderAssignedCard order={order as any} />
              </div>
            </>
          )}

          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
            <h3 className="text-lg font-bold text-brand-blue">Products Ordered</h3>

            <div className="mt-6">
              {order.items.length === 0 ? (
                <p className="text-sm text-slate-500">No ordered items found.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-2 sm:px-3"
                      >
                        <div>
                          <p className="text-base font-semibold text-brand-blue">
                            {item.product_name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="text-lg font-semibold text-brand-blue pr-1">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  <div className="space-y-3 px-2 sm:px-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-sm">Subtotal</span>
                      <span className="text-sm font-medium">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>

                    {!isPickup && (
                        <p className="text-xs text-slate-400">
                          Delivery fee is paid directly to the rider upon delivery.
                        </p>
                      )}


                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-sm">Payment</span>
                      <span className="text-sm font-medium">{getPaymentLabel(order.paymentmethod)}</span>
                    </div>

                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-brand-blue">Total</span>
                        <span className="text-lg font-bold text-brand-blue">
                          {formatPrice(order.subtotal)}
                        </span>
                      </div>



                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isPickup && (
            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-brand-blue">Delivery Address</h3>
              <p className="mt-3 text-slate-600">
                {order.delivery_address || "No delivery address found."}
              </p>
              <div className="mt-5 h-64 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                Map placeholder for live delivery tracking
              </div>
            </div>
          )}

          <div className="mx-auto w-full max-w-3xl">
            <Link
              href="/products"
              className="block w-full rounded-2xl bg-[#2f8f83] py-4 text-center text-lg font-semibold text-white transition hover:bg-[#26776d]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}