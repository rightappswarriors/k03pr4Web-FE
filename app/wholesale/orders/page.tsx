"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Package, RefreshCw, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";
import { useSocket } from "@/providers/SocketProvider";
import { purchaseOrderApi } from "@/services/purchase-order.service";
import { formatPrice } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/wholesale";

const STATUS = {
  all: { label: "All", matches: () => true },
  review: { label: "Review", matches: (po: PurchaseOrder) => po.status === "PENDING" },
  accepted: { label: "Accepted", matches: (po: PurchaseOrder) => po.status === "ACCEPTED" },
  payment: {
    label: "Payment",
    matches: (po: PurchaseOrder) => po.status === "ACCEPTED" && po.paymentStatus === "PENDING",
  },
  delivery: {
    label: "Delivery",
    matches: (po: PurchaseOrder) => ["IN_TRANSIT", "DELIVERED"].includes(po.status),
  },
} as const;

function statusLabel(status: string) {
  return (
    (
      {
        PENDING: "Pending Review",
        ACCEPTED: "Accepted",
        REJECTED: "Rejected",
        IN_TRANSIT: "In Delivery",
        DELIVERED: "Completed",
        CANCELLED: "Cancelled",
      } as Record<string, string>
    )[status] ?? status
  );
}
function StatusPill({ po }: { po: PurchaseOrder }) {
  const tone =
    po.status === "PENDING"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : po.status === "ACCEPTED" || po.status === "DELIVERED"
        ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
        : po.status === "REJECTED" || po.status === "CANCELLED"
          ? "bg-red-50 text-red-700 ring-red-200"
          : "bg-blue-50 text-blue-700 ring-blue-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabel(po.status)}
    </span>
  );
}
function deliveryLabel(po: PurchaseOrder) {
  return po.delivery?.scheduledDate
    ? new Date(po.delivery.scheduledDate).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : po.status === "DELIVERED"
      ? "Delivered"
      : "Not scheduled";
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<keyof typeof STATUS>("all");
  const { subscribe } = useSocket();
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await purchaseOrderApi.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(
    () =>
      subscribe(({ event }) => {
        if (event.startsWith("purchaseOrder:")) void load();
      }),
    [subscribe, load],
  );
  const visible = useMemo(
    () =>
      orders.filter((po) => {
        const text =
          `${po.poNumber} ${po.supplier?.name ?? ""} ${po.lineItems.map((item) => item.itemName || item.supplierItem.name).join(" ")}`.toLowerCase();
        return STATUS[filter].matches(po) && text.includes(query.trim().toLowerCase());
      }),
    [orders, query, filter],
  );
  return (
    <AgentAuthProvider>
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="min-w-0 flex-1">
            <div className="container-shell py-6 sm:py-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Purchase Orders
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Track supplier purchase orders, payments and delivery.
                  </p>
                </div>
                <button
                  onClick={() => void load()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="size-4" />
                  Refresh
                </button>
              </div>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search purchase orders..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-[#2f8f83]/20 focus:border-[#2f8f83] focus:ring-4"
                  />
                </label>
                <div className="flex max-w-full gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {(Object.keys(STATUS) as Array<keyof typeof STATUS>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${filter === key ? "bg-[#287c72] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
                    >
                      {STATUS[key].label}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                  <button onClick={() => void load()} className="font-semibold underline">
                    Try again
                  </button>
                </div>
              )}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
                  <Package className="mx-auto size-10 text-slate-300" />
                  <h2 className="mt-3 font-semibold text-slate-900">
                    {orders.length ? "No purchase orders found" : "No purchase orders yet"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {orders.length
                      ? "Try changing your search or filter."
                      : "Purchase orders created for you will appear here."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
                    <table className="w-full min-w-[980px] text-sm">
                      <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="p-4">PO Number</th>
                          <th className="p-4">Supplier</th>
                          <th className="p-4">Items</th>
                          <th className="p-4">Order date</th>
                          <th className="p-4 text-right">Total</th>
                          <th className="p-4">PO status</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Delivery</th>
                          <th className="p-4" />
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((po) => {
                          const first = po.lineItems[0];
                          return (
                            <tr
                              key={po.id}
                              className="border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                            >
                              <td className="p-4">
                                <Link
                                  href={`/wholesale/orders/${po.id}`}
                                  className="font-semibold text-[#287c72] hover:underline"
                                >
                                  {po.poNumber}
                                </Link>
                              </td>
                              <td className="p-4">
                                <div className="font-medium text-slate-800">
                                  {po.supplier?.name ?? "Supplier"}
                                </div>
                                {po.supplier?.verified && (
                                  <span className="text-xs font-medium text-emerald-700">
                                    Verified supplier
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="font-medium text-slate-700">
                                  {po.lineItems.length}{" "}
                                  {po.lineItems.length === 1 ? "item" : "items"}
                                </div>
                                {first && (
                                  <p className="max-w-36 truncate text-xs text-slate-500">
                                    {first.itemName || first.supplierItem.name}
                                    {po.lineItems.length > 1
                                      ? ` +${po.lineItems.length - 1} more`
                                      : ""}
                                  </p>
                                )}
                              </td>
                              <td className="p-4 whitespace-nowrap text-slate-600">
                                {new Date(po.createdAt).toLocaleDateString("en-PH", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="p-4 text-right font-semibold whitespace-nowrap text-slate-900">
                                {formatPrice(po.totalAmount)}
                              </td>
                              <td className="p-4">
                                <StatusPill po={po} />
                              </td>
                              <td className="p-4">
                                <span className="text-xs font-medium text-slate-700">
                                  {po.paymentStatus === "PENDING"
                                    ? "Payment Pending"
                                    : po.paymentStatus}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap text-xs text-slate-600">
                                {deliveryLabel(po)}
                              </td>
                              <td className="p-4">
                                <Link
                                  aria-label={`View ${po.poNumber}`}
                                  href={`/wholesale/orders/${po.id}`}
                                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold text-[#287c72] hover:bg-[#e6f4f1]"
                                >
                                  <Eye className="size-4" />
                                  View
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-3 lg:hidden">
                    {visible.map((po) => {
                      const first = po.lineItems[0];
                      return (
                        <Link
                          key={po.id}
                          href={`/wholesale/orders/${po.id}`}
                          className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#287c72]">{po.poNumber}</p>
                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {po.supplier?.name ?? "Supplier"}
                              </p>
                            </div>
                            <StatusPill po={po} />
                          </div>
                          <p className="mt-4 text-sm text-slate-700">
                            {first?.itemName || first?.supplierItem.name || "Order items"}
                            {po.lineItems.length > 1 ? ` + ${po.lineItems.length - 1} more` : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {po.lineItems.length} {po.lineItems.length === 1 ? "item" : "items"}
                          </p>
                          <p className="mt-4 text-lg font-bold text-slate-900">
                            {formatPrice(po.totalAmount)}
                          </p>
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                            <span>
                              Payment{" "}
                              {po.paymentStatus === "PENDING" ? "Pending" : po.paymentStatus}
                            </span>
                            <span>
                              {new Date(po.createdAt).toLocaleDateString("en-PH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </AgentAuthProvider>
  );
}