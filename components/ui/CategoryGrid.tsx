import Link from "next/link";
import { categories } from "@/data/categories";
import {
  Dumbbell,
  Gamepad2,
  HeartPulse,
  Home,
  Laptop,
  PawPrint,
  Shirt,
  ShoppingBasket,
} from "lucide-react";

const categoryIcons = {
  electronics: Laptop,
  fashion: Shirt,
  beauty: HeartPulse,
  home: Home,
  groceries: ShoppingBasket,
  sports: Dumbbell,
  toys: Gamepad2,
  pets: PawPrint,
};

export default function CategoryGrid() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
            Categories
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#10231f] sm:text-3xl">
            Browse by need
          </h2>
        </div>
        <Link
          href="/products"
          className="text-sm font-bold text-[#1f5f56] transition hover:text-[#f97316]"
        >
          View all products
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => {
          const Icon =
            categoryIcons[category.slug as keyof typeof categoryIcons] ??
            ShoppingBasket;

          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group rounded-2xl border border-[#ded8cc] bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-[#2f8f83]/45"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f0e8] text-[#1f5f56] transition group-hover:bg-[#e4f1eb]">
                <Icon className="h-5 w-5" />
              </div>
              <span className="mt-3 block text-sm font-bold text-[#10231f]">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
