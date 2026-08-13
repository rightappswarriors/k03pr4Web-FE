"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Package,
  Bell,
  Handshake,
  CheckCircle,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { getAgentDashboard } from "@/services/dashboardService";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentOrders from "@/components/dashboard/RecentOrders";
import RecentRFQs from "@/components/dashboard/RecentRFQs";
import QuickActions from "@/components/dashboard/QuickActions";
import type { DashboardResponse } from "@/types/dashboard";
import { useAgentAuth } from "@/hooks/useAgentAuth";

function getAgentName(): string {
  if (typeof localStorage === "undefined") return "Agent";
  try {
    const stored = localStorage.getItem("agent");
    if (stored) {
      const agent = JSON.parse(stored);
      return agent.fullname || agent.full_name || agent.email || "Agent";
    }
  } catch {
    return "Agent";
  }
  return "Agent";
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>("Agent");

  // Use the shared auth hook so we only fetch data AFTER authentication
  // has been fully restored (token checked / refreshed).
  const { isAuthenticated, isLoading: authLoading, logout } = useAgentAuth();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAgentDashboard();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fire the dashboard request once auth initialization is complete
  // and the agent is confirmed authenticated. This prevents stale / missing
  // tokens from causing failed requests on page refresh.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setAgentName(getAgentName());
      fetchDashboard();
    }
  }, [authLoading, isAuthenticated, fetchDashboard]);

  // Redirect to login if not authenticated after auth check completes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?role=agent");
    }
  }, [authLoading, isAuthenticated, router]);

  // If still initializing auth, show the skeleton (no API calls fired yet).
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <DashboardSkeleton />
      </main>
    );
  }

  // Auth check complete but not authenticated — redirect in progress
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header wholesale />

      <div className="flex">
        <DashboardSidebar />

        <div className="flex-1 overflow-x-hidden">
          {/* Page header */}
          <section className="border-b border-slate-200 bg-white">
            <div className="container-shell py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">
                    Welcome back, {agentName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Here&apos;s what&apos;s happening with your wholesale activity today.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchDashboard}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f8f83]"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f8f83]"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                  <Link
                    href="/wholesale/rfqs"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f8f83]"
                  >
                    <FileText className="size-4" />
                    RFQs
                  </Link>
                  <Link
                    href="/wholesale/inbox"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#ea580c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]"
                  >
                    <MessageSquare className="size-4" />
                    Inbox
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Dashboard content */}
          {loading && <DashboardSkeleton />}

          {error && (
            <div className="container-shell py-8">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          {data && !loading && !error && (
            <div className="container-shell py-8 space-y-8">
              {/* KPI Stat Cards */}
              <section>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DashboardStatCard
                    title="Pending Quotations"
                    value={data.stats.pendingQuotations}
                    subtitle="Supplier has responded"
                    icon={FileText}
                  />
                  <DashboardStatCard
                    title="Waiting Replies"
                    value={data.stats.waitingSupplierReplies}
                    subtitle="Awaiting supplier response"
                    icon={MessageSquare}
                  />
                  <DashboardStatCard
                    title="Orders Processing"
                    value={data.stats.processingOrders}
                    subtitle="Orders currently being processed"
                    icon={Package}
                  />
                  <DashboardStatCard
                    title="Unread Messages"
                    value={data.stats.unreadMessages}
                    subtitle="Supplier conversations"
                    icon={Bell}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DashboardStatCard
                    title="Pending Negotiations"
                    value={data.stats.pendingNegotiations}
                    subtitle="RFQs in negotiation"
                    icon={Handshake}
                  />
                  <DashboardStatCard
                    title="Counter Offers"
                    value={data.stats.counterOffersReceived}
                    subtitle="Offers from suppliers"
                    icon={FileText}
                  />
                  <DashboardStatCard
                    title="Accepted Offers"
                    value={data.stats.acceptedOffers}
                    subtitle="Negotiations accepted"
                    icon={CheckCircle}
                  />
                </div>
              </section>

              {/* Recent Activity + Recent Orders */}
              <section className="grid gap-4 lg:grid-cols-2">
                <RecentActivity items={data.recentActivity} />
                <RecentOrders orders={data.recentOrders} />
              </section>

              {/* Recent RFQs + Quick Actions */}
              <section className="grid gap-4 lg:grid-cols-2">
                <RecentRFQs rfqs={data.recentRFQs} />
                <QuickActions />
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
