"use client";

import { BadgeCheck, ClipboardList, Factory, ShieldCheck, SlidersHorizontal, PackageCheck } from "lucide-react";

const quickActions: { title: string; text: string; icon: typeof ClipboardList }[] = [
  { title: "Request for Quotation", text: "Receive competitive quotes", icon: ClipboardList },
  { title: "Verified Suppliers", text: "Trusted trade partners", icon: BadgeCheck },
  { title: "Trade Assurance", text: "Secure transactions", icon: ShieldCheck },
  { title: "Bulk Discounts", text: "Better prices at volume", icon: PackageCheck },
  { title: "Fast Customization", text: "OEM and ODM available", icon: SlidersHorizontal },
];

function QuickActionCard({ title, text, icon: Icon }: (typeof quickActions)[number]) {
  return (
    <button
      type="button"
      className="group flex min-w-52 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      aria-label={title}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-white">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-bold text-slate-900">{title}</span>
        <span className="block text-xs text-slate-500">{text}</span>
      </span>
    </button>
  );
}

export default function QuickActionStrip() {
  return (
    <section aria-label="Wholesale services" className="border-y border-slate-200 bg-white">
      <div className="container-shell flex snap-x gap-2 overflow-x-auto py-2 [scrollbar-width:none]">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>
    </section>
  );
}