"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { RecentOrder } from "@/types/dashboard";

interface RecentOrdersProps {
  orders: RecentOrder[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
        <div className="mt-4 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ShoppingCart className="h-6 w-6 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-slate-500">No recent orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
      <div className="mt-4 flow-root">
        <ul className="divide-y divide-slate-100">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/wholesale/orders/${order.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-[#2f8f83]">
                    {order.orderNumber}
                  </span>
                  <span className="text-sm text-slate-600">{order.supplier}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium">₱{order.total.toLocaleString()}</span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {order.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
