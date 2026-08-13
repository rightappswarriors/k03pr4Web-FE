import Link from "next/link";

type WholesaleBreadcrumbProps = {
  category?: string;
  productName?: string;
};

export default function WholesaleBreadcrumb({ category, productName }: WholesaleBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500">
      <Link href="/wholesale" className="hover:text-emerald-600">
        Wholesale
      </Link>
      {category && (
        <>
          <span className="text-slate-300">/</span>
          <Link href="/wholesale/products" className="hover:text-emerald-600">
            {category}
          </Link>
        </>
      )}
      {productName && (
        <>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-900 line-clamp-1">{productName}</span>
        </>
      )}
    </nav>
  );
}