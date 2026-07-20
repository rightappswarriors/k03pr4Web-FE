"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, MoreVertical, Eye, ShoppingCart } from "lucide-react";
import Header from "@/components/layout/Header";
import Link from "next/link";
import type { WholesaleQuote, QuoteStatus } from "@/types/wholesale";

const mockQuotes: WholesaleQuote[] = [
  {
    id: "quote-1",
    productId: "product-1",
    productName: "Portland Cement Type 1",
    supplier: "BuildPro Materials",
    supplierVerified: true,
    status: "quoted",
    quantity: "1000 bags",
    targetPrice: "₱240.00",
    quotedPrice: "₱235.00",
    currency: "PHP",
    submittedDate: "2024-01-15",
    expiryDate: "2024-02-15",
    notes: "Price includes delivery to Cebu Port",
  },
  {
    id: "quote-2",
    productId: "product-5",
    productName: "Solar Panel 550W",
    supplier: "SunGrid Philippines",
    supplierVerified: true,
    status: "pending",
    quantity: "50 pcs",
    targetPrice: "₱6,000.00",
    currency: "PHP",
    submittedDate: "2024-01-14",
  },
  {
    id: "quote-3",
    productId: "product-3",
    productName: "Jasmine Rice Premium Grade",
    supplier: "Nueva Harvest Co.",
    supplierVerified: true,
    status: "accepted",
    quantity: "200 sacks",
    quotedPrice: "₱48.00",
    currency: "PHP",
    submittedDate: "2024-01-10",
  },
];

const statusConfig: Record<QuoteStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-slate-100 text-slate-600", icon: Clock },
  quoted: { label: "Quoted", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  expired: { label: "Expired", color: "bg-slate-100 text-slate-500", icon: Clock },
};

export default function QuoteManagementPage() {
  const [quotes, setQuotes] = useState(mockQuotes);

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header wholesale />

      <div className="container-shell py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Quotes</h1>
          <p className="text-slate-600">Track and manage your requested quotations</p>
        </div>

        <div className="rounded-xl bg-white overflow-hidden">
          {/* Stats Summary */}
          <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50">
            {(["pending", "quoted", "accepted", "rejected"] as QuoteStatus[]).map((status) => {
              const count = quotes.filter((q) => q.status === status).length;
              const config = statusConfig[status];
              return (
                <div key={status} className="p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-sm text-slate-500">{config.label}</p>
                </div>
              );
            })}
          </div>

          {/* Quotes Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
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
                    Price
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
                {quotes.map((quote) => {
                  const config = statusConfig[quote.status];
                  const Icon = config.icon;
                  return (
                    <tr key={quote.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{quote.productName}</p>
                          <p className="text-sm text-slate-500">ID: #{quote.id.split("-")[1]}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{quote.supplier}</span>
                          {quote.supplierVerified && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{quote.quantity}</td>
                      <td className="px-6 py-4">
                        <div>
                          {quote.quotedPrice ? (
                            <p className="font-medium text-slate-900">
                              {quote.quotedPrice} {quote.currency}
                            </p>
                          ) : (
                            <p className="text-slate-500">Quoted price pending</p>
                          )}
                          {quote.targetPrice && (
                            <p className="text-sm text-slate-500">Target: {quote.targetPrice}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                        >
                          <Icon className="size-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/wholesale/products/${quote.productId}`}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                            title="View product"
                          >
                            <Eye className="size-4" />
                          </Link>
                          {quote.status === "quoted" && (
                            <button
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                              onClick={() => console.log("Accept quote:", quote.id)}
                            >
                              <ShoppingCart className="size-3 inline mr-1" />
                              Accept
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {quotes.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500 mb-4">No quotes found</p>
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
  );
}