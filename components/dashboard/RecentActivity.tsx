"use client";

import { Clock, CheckCircle2, Truck, MessageSquare, Bell, XCircle } from "lucide-react";
import type { ActivityItem } from "@/types/dashboard";

const iconMap: Record<string, React.ElementType> = {
  Quotation: Clock,
  Check: CheckCircle2,
  Package: Truck,
  Message: MessageSquare,
  Bell: Bell,
  XCircle: XCircle,
};

interface RecentActivityProps {
  items: ActivityItem[];
}

export default function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        <div className="mt-4 py-8 text-center">
          <p className="text-sm text-slate-500">No recent activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
      <div className="mt-4 flow-root">
        <ul className="-mb-8">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] || Clock;
            return (
              <li key={item.id}>
                <div className="relative pb-8">
                  {index < items.length - 1 && (
                    <span
                      className="absolute left-4 top-4 h-full w-0.5 bg-slate-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f4f1]">
                      <Icon className="size-4 text-[#2f8f83]" aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
