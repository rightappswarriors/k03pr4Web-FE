"use client";

import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
}

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f4f1]">
          <Icon className="size-5 text-[#2f8f83]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
