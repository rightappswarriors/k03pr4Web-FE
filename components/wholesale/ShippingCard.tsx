import { Clock, MapPin, Truck } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";

type ShippingCardProps = {
  product: WholesaleProduct;
};

export default function ShippingCard({ product }: ShippingCardProps) {
  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping & Delivery</h2>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="size-5 text-slate-400" />
          <div>
            <span className="text-sm font-medium text-slate-500">Ships from</span>
            <p className="text-slate-900">{product.shippingFrom}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Truck className="size-5 text-slate-400" />
          <div>
            <span className="text-sm font-medium text-slate-500">Shipping method</span>
            <p className="text-slate-900">LTL (Less than truckload)</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="size-5 text-slate-400" />
          <div>
            <span className="text-sm font-medium text-slate-500">Estimated delivery</span>
            <p className="text-slate-900">{product.leadTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}