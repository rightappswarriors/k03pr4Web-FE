import { CheckCircle, Clock, MapPin, Shield, Star } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";

type ProductSupplierCardProps = {
  product: WholesaleProduct;
};

export default function ProductSupplierCard({ product }: ProductSupplierCardProps) {
  return (
    <div className="rounded-xl bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{product.supplier}</h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="size-4" />
            <span>{product.supplierLocation || "Location not specified"}</span>
          </div>
        </div>
        {product.supplierVerified && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            <Shield className="size-3" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {product.supplierResponseTime && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <Clock className="size-4 text-emerald-600" />
          <span>Response time: {product.supplierResponseTime}</span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Supplier Rating</span>
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900">{product.rating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total Orders</span>
          <span className="font-semibold text-slate-900">{product.totalOrders?.toLocaleString() || 0}</span>
        </div>
      </div>
    </div>
  );
}