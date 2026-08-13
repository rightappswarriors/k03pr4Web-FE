import { Clock, MapPin, Truck } from "lucide-react";
import type { ProductShipping } from "@/types/wholesale";

type ShippingBuilderProps = {
  shipping: ProductShipping;
};

export default function ShippingBuilder({ shipping }: ShippingBuilderProps) {
  if (!shipping || Object.keys(shipping).length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping Information</h2>
      <div className="space-y-4">
        {(shipping.originCountry || shipping.originProvince || shipping.originCity) && (
          <div className="flex items-start gap-3">
            <MapPin className="size-5 text-slate-400 mt-0.5" />
            <div>
              <span className="text-sm font-medium text-slate-500">Origin</span>
              <p className="text-slate-900">
                {[shipping.originCity, shipping.originProvince, shipping.originCountry].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        )}

        {shipping.estimatedDays && (
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-slate-400" />
            <div>
              <span className="text-sm font-medium text-slate-500">Estimated Delivery</span>
              <p className="text-slate-900">{shipping.estimatedDays} business days</p>
            </div>
          </div>
        )}

        {shipping.shippingNotes && (
          <div className="flex items-start gap-3">
            <Truck className="size-5 text-slate-400 mt-0.5" />
            <div>
              <span className="text-sm font-medium text-slate-500">Shipping Notes</span>
              <p className="text-slate-700 text-sm">{shipping.shippingNotes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}