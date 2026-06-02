import Link from "next/link";
import { categories } from "@/data/categories";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="card flex flex-col items-center justify-center gap-3 p-5 text-center transition hover:-translate-y-1"
        >
          <div className="text-3xl">{category.icon}</div>
          <span className="text-sm font-medium text-brand-blue">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}