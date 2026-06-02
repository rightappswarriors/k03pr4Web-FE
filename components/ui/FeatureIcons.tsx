import Link from "next/link";
import { BadgePercent, Building2, PackageCheck, Truck } from "lucide-react";

const features = [
  {
    title: "Deals",
    description: "Current store promos",
    icon: BadgePercent,
    href: "/products",
  },
  {
    title: "Delivery",
    description: "Available local routes",
    icon: Truck,
    href: "/products",
  },
  {
    title: "Pickup",
    description: "Branch-ready orders",
    icon: PackageCheck,
    href: "/stores",
  },
  {
    title: "Stores",
    description: "Verified sellers",
    icon: Building2,
    href: "/stores",
  },
];

export default function FeatureIcons() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {features.map((feature) => (
        <Link
          key={feature.title}
          href={feature.href}
          className="group flex items-center gap-4 rounded-2xl border border-[#ded8cc] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#2f8f83]/45"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f0e8] text-[#1f5f56] transition group-hover:bg-[#e4f1eb]">
            <feature.icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-black text-[#10231f]">
              {feature.title}
            </h3>
            <p className="mt-1 text-xs text-[#7d877f]">{feature.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
