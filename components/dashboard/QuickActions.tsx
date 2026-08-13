"use client";

import { Package, FileText, ShoppingCart, MessageSquare } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    label: "Browse Products",
    href: "/wholesale/products",
    icon: Package,
    color: "teal",
  },
  {
    label: "My RFQs",
    href: "/wholesale/rfqs",
    icon: FileText,
    color: "blue",
  },
  {
    label: "My Orders",
    href: "/wholesale/orders",
    icon: ShoppingCart,
    color: "orange",
  },
  {
    label: "Messages",
    href: "/wholesale/inbox",
    icon: MessageSquare,
    color: "slate",
  },
];

const colorMap: Record<string, { bg: string; hover: string; text: string; iconBg: string; iconText: string }> = {
  teal: {
    bg: "bg-[#2f8f83]",
    hover: "hover:bg-[#26776d]",
    text: "text-[#2f8f83]",
    iconBg: "bg-[#e6f4f1]",
    iconText: "text-[#2f8f83]",
  },
  blue: {
    bg: "bg-[#07245e]",
    hover: "hover:bg-[#061d4a]",
    text: "text-[#07245e]",
    iconBg: "bg-[#e6eeff]",
    iconText: "text-[#07245e]",
  },
  orange: {
    bg: "bg-[#f97316]",
    hover: "hover:bg-[#ea580c]",
    text: "text-[#f97316]",
    iconBg: "bg-[#fff4e5]",
    iconText: "text-[#f97316]",
  },
  slate: {
    bg: "bg-slate-600",
    hover: "hover:bg-slate-700",
    text: "text-slate-600",
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
  },
};

export default function QuickActions() {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const colors = colorMap[action.color];
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex items-center gap-3 rounded-lg ${colors.bg} px-4 py-3 ${colors.hover} transition-colors`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg}`}>
                <Icon className={`size-4 ${colors.iconText}`} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-white">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
