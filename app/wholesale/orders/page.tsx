"use client";

import { Truck, CheckCircle, Clock, XCircle, Eye, Package } from "lucide-react";
import Header from "@/components/layout/Header";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";
import Link from "next/link";
import type { WholesaleOrder, OrderStatus } from "@/types/wholesale";

const mockOrders: WholesaleOrder[] = [
  {
    id: "order-1",
    orderNumber: "WH-2024-00145",
    productId: "product-1",
    productName: "Portland Cement Type 1",
    supplier: "BuildPro Materials",
    quantity: 1000,
    unitPrice: "₱235.00",
    totalAmount: "₱235,000.00",
    currency: "PHP",
    status: "processing",
    orderDate: "2024-01-10",
    deliveryDate: "2024-01-15",
    shippingAddress: "Cebu Port, Cebu City",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "order-2",
    orderNumber: "WH-2024-00140",
    productId: "product-3",
    productName: "Jasmine Rice Premium Grade",
    supplier: "Nueva Harvest Co.",
    quantity: 200,
    unitPrice: "₱48.00",
    totalAmount: "₱9,600.00",
    currency: "PHP",
    status: "delivered",
    orderDate: "2024-01-05",
    deliveryDate: "2024-01-08",
    shippingAddress: "Manila Warehouse",
    paymentMethod: "Trade Assurance",
  },
  {
    id: "order-3",
    orderNumber: "WH-2024-00130",
    productId: "product-5",
    productName: "Solar Panel 550W",
    supplier: "SunGrid Philippines",
    quantity: 50,
    unitPrice: "₱6,200.00",
    totalAmount: "₱310,000.00",
    currency: "PHP",
    status: "shipped",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-22",
    shippingAddress: "Davao Industrial Park",
    paymentMethod: "Letter of Credit",
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-slate-100 text-slate-600", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-amber-100 text-amber-700", icon: Clock },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function WholesaleOrdersPage() {
  return (
    <AgentAuthProvider>
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header wholesale />

      <div className="container-shell py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-600">Track and manage your wholesale purchases</p>
        </div>

        <div className="rounded-xl bg-white overflow-hidden">
          {mockOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockOrders.map((order) => {
                    const config = statusConfig[order.status];
                    const Icon = config.icon;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{order.orderNumber}</p>
                          <p className="text-sm text-slate-500">{order.orderDate}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                              <Package className="size-5 text-slate-600" />
                            </div>
                            <span className="font-medium text-slate-900">{order.productName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{order.supplier}</td>
                        <td className="px-6 py-4 text-slate-600">{order.quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{order.totalAmount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                          >
                            <Icon className="size-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/wholesale/orders/${order.id}`}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                            title="View order details"
                          >
                            <Eye className="size-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-500 mb-4">No orders found</p>
              <Link
                href="/wholesale/products"
                className="inline-block rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
    </AgentAuthProvider>
  );
}