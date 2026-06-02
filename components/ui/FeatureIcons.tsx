import Link from "next/link";

const features = [
  {
    title: "Flash Deals",
    icon: "⚡",
    bg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    title: "Free Shipping",
    icon: "🚚",
    bg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    title: "Rewards",
    icon: "🪙",
    bg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    title: "Mall",
    icon: "🏬",
    bg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
];

export default function FeatureIcons() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {features.map((feature) => (
        <Link
          key={feature.title}
          href="/products"
          className="group flex items-center gap-4 rounded-2xl bg-[#f8fafc] px-5 py-4 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]"
        >
          {/* Icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.bg} ${feature.iconColor} text-xl transition-all duration-300 group-hover:scale-110`}
          >
            {feature.icon}
          </div>

          {/* Text */}
          <div className="leading-tight">
            <h3 className="font-semibold text-brand-blue text-sm md:text-base">
              {feature.title}
            </h3>
            <p className="text-xs text-slate-500">Explore now</p>
          </div>
        </Link>
      ))}
    </div>
  );
}