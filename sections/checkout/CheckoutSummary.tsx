"use client";

import { formatPrice } from "@/lib/utils";

type CheckoutItem = {
  id: string | number;
  name: string;
  image?: string | null;
  price: number;
  cartQuantity: number;
};

type CheckoutSummaryProps = {
  items: CheckoutItem[];
  deliveryFee?: number;
  mode?: "delivery" | "pickup" | null;
};

export default function CheckoutSummary({
  items,
  deliveryFee = 0,
  mode,
}: CheckoutSummaryProps) {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.cartQuantity;
  }, 0);

  const total = subtotal;

  return (
    <div className="card rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-brand-blue">Order Summary</h3>

      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">
            No items in cart yet.
          </p>
        ) : (
          items.map((item) => {
            const itemTotal = item.price * item.cartQuantity;

            return (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <img
                    src={item.image || "/img/green_logo.png"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/img/green_logo.png";
                    }}
                  />
                </div>

                <div className="flex flex-1 items-center justify-between gap-2">
                  <div>
                    <p className="line-clamp-1 font-medium text-brand-blue">
                      {item.name}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Qty: {item.cartQuantity}
                    </p>
                  </div>

                  <p className="font-bold text-[#3a9688]">
                    {formatPrice(itemTotal)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {mode === "delivery" && (
          <p className="text-xs text-slate-400">
            Delivery fee will be paid separately upon delivery.
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-lg font-bold text-brand-blue">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}