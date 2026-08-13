"use client";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>

      {/* Recent Activity + RFQs row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>

      {/* Top Suppliers */}
      <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
