import { CheckCircle, Clock, Package, ShoppingCart, Table as TableIcon } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";

type ProductSummaryProps = {
  product: WholesaleProduct;
};

export default function ProductSummary({ product }: ProductSummaryProps) {
  const hasAttributes = product.attributes && product.attributes.length > 0;
  console.log(product.priceTiers)
  return (
    <div className="space-y-6">
      {/* Product Title Card */}
      <div className="rounded-xl bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">{product.name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          {/* Description - full width, own line */}
          {product.description && (
            <p className="w-full text-slate-700">
              {product.description}
            </p>
          )}

          {product.verified && (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="size-4" />
              <span>Verified Supplier</span>
            </div>
          )}

          {product.totalOrders && (
            <div className="text-slate-600">
              {product.totalOrders.toLocaleString()} orders
            </div>
          )}

          {product.rating && (
            <div className="flex items-center gap-1">
              <span className="text-amber-500">★★★★☆</span>
              <span className="text-slate-600">{product.rating.toFixed(1)} rating</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Attributes - Compact Grid Layout */}
      {hasAttributes && (
        <div className="rounded-xl bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <TableIcon className="size-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Key Attributes</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {product.attributes!.map((attr, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-3">
                <span className="text-xs font-medium text-slate-500 uppercase">{attr.name}</span>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{attr.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Details Card */}
      <div className="rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Product Details</h2>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <Package className="size-5 text-slate-400" />
            <div>
              <span className="text-sm text-slate-500">MOQ:</span>
              <span className="ml-2 font-semibold text-slate-900">{product.moq}</span>
            </div>
          </div>

          {product.sampleAvailable && product.samplePrice && (
            <div className="flex items-center gap-3">
              <ShoppingCart className="size-5 text-slate-400" />
              <div>
                <span className="text-sm text-slate-500">Sample price:</span>
                <span className="ml-2 font-semibold text-slate-900">{product.samplePrice}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Clock className="size-5 text-slate-400" />
            <div>
              <span className="text-sm text-slate-500">Lead time:</span>
              <span className="ml-2 font-semibold text-slate-900">{product.leadTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Unit:</span>
            <span className="font-semibold text-slate-900">{product.unit}</span>
          </div>

          {product.shippingFrom && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Ships from:</span>
              <span className="font-semibold text-slate-900">{product.shippingFrom}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}