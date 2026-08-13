"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Filter, RefreshCw, Eye, Trash2, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { rfqApi } from "@/services/rfq.service";
import { RFQ_STATUS_CONFIG } from "@/types/wholesale";
import type { RfqListItem, RfqStatus } from "@/types/wholesale";
import { useAgentAuth } from "@/hooks/useAgentAuth";

const ALL_STATUSES: RfqStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEGOTIATING",
  "NEGOTIATION_COMPLETED",
  "NEGOTIATION_ACCEPTED",
  "PO_CREATED",
  "CANCELLED",
  "EXPIRED",
];

const STATUS_FILTERS: { label: string; value: RfqStatus | null }[] = [
  { label: "All RFQs", value: null },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Negotiating", value: "NEGOTIATING" },
  { label: "Offer Accepted", value: "NEGOTIATION_ACCEPTED" },
  { label: "PO Created", value: "PO_CREATED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function RfqListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}

export default function RfqListPage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RfqListItem[]>([]);
  const [filtered, setFiltered] = useState<RfqListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<RfqStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { isAuthenticated, isLoading: authLoading } = useAgentAuth();

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rfqApi.listRFQs();
      setRfqs(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load RFQs. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch RFQs after auth has been fully restored
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchRfqs();
    }
  }, [authLoading, isAuthenticated, fetchRfqs]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?role=agent");
    }
  }, [authLoading, isAuthenticated, router]);

  // Apply filters
  useEffect(() => {
    let result = rfqs;

    if (activeFilter) {
      result = result.filter((rfq) => rfq.status === activeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (rfq) =>
          rfq.rfqNumber.toLowerCase().includes(term) ||
          rfq.supplier.toLowerCase().includes(term),
      );
    }

    setFiltered(result);
  }, [rfqs, activeFilter, searchTerm]);

  const handleDelete = async (id: string, rfqNumber: string) => {
    if (!confirm(`Delete RFQ #${rfqNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await rfqApi.deleteRfq(id);
      setRfqs((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete RFQ.");
    }
  };

  // While auth is being restored, don't render page content (no API calls fired)
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Header wholesale />
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 overflow-x-auto">
            <div className="container-shell py-8">
              <RfqListSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Not authenticated — redirect handled by useEffect above
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header wholesale />

      <div className="flex">
        <DashboardSidebar />

        <div className="flex-1 overflow-x-auto">
          <div className="container-shell py-8">
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My RFQs</h1>
                <p className="mt-1 text-slate-600">
                  Manage your Request for Quotations to suppliers
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/wholesale/inbox"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <MessageSquare className="size-4" />
                  Inbox
                </Link>
                <Link
                  href="/wholesale/products"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#ea580c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]"
                >
                  <FileText className="size-4" />
                  Browse Products
                </Link>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by RFQ number or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={fetchRfqs}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>

            {/* Status filter tabs */}
            <div className="mb-6 overflow-x-auto">
              <div className="inline-flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-slate-200">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      activeFilter === filter.value
                        ? "bg-[#2f8f83] text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading && <RfqListSkeleton />}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm border border-slate-100">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-slate-900">
                  {searchTerm || activeFilter
                    ? "No RFQs match your filters"
                    : "No RFQs yet"}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {searchTerm || activeFilter
                    ? "Try adjusting your search or filter criteria."
                    : "Browse products and request quotations directly from supplier pages."}
                </p>
                {!searchTerm && !activeFilter && (
                  <Link
                    href="/wholesale/products"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <FileText className="size-4" />
                    Browse Products
                  </Link>
                )}
              </div>
            )}

            {/* RFQ Table */}
            {!loading && !error && filtered.length > 0 && (
              <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          RFQ #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Expected Delivery
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Updated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filtered.map((rfq) => {
                        const config = RFQ_STATUS_CONFIG[rfq.status];
                        return (
                          <tr key={rfq.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <span className="font-mono font-semibold text-slate-900">
                                {rfq.rfqNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {rfq.supplier}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {rfq.product}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {rfq.quantity}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                              >
                                {config.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {rfq.expectedDeliveryDate
                                ? new Date(rfq.expectedDeliveryDate).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(rfq.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/wholesale/rfqs/${rfq.id}`}
                                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                                  title="View RFQ"
                                >
                                  <Eye className="size-4" />
                                </Link>
                                {rfq.status !== "NEGOTIATION_ACCEPTED" &&
                                  rfq.status !== "PO_CREATED" &&
                                  rfq.status !== "CANCELLED" &&
                                  rfq.status !== "EXPIRED" && (
                                  <button
                                    onClick={() =>
                                      handleDelete(rfq.id, rfq.rfqNumber)
                                    }
                                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                                    title="Delete RFQ"
                                  >
                                    <Trash2 className="size-4" />
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

                {/* Summary footer */}
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {filtered.length} RFQ{filtered.length !== 1 ? "s" : ""} shown
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
