import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";

type RelatedProductsProps = {
  products: WholesaleProduct[];
};

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Related Products</h2>
        <Link href="/wholesale/products" className="flex items-center text-sm font-medium text-emerald-600 hover:underline">
          View all
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/wholesale/products/${product.id}`} className="group block">
            <div className="aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={product.images?.[0] || product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="mt-2 text-sm font-medium text-slate-900 line-clamp-2">{product.name}</h3>
            <p className="mt-1 text-sm text-emerald-600 font-semibold">{product.priceTiers?.[0]?.unitPrice || product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}