"use client";

import { ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";

type OrderType = {
  id: number; 
  transactionnumber: string; 
  date: string;
  total: number;
  status: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  order_type: "DELIVERY" | "PICKUP";
};

type Props = {
  orders: OrderType[];
  loading: boolean;
  expandedOrder: number | null;
  setExpandedOrder: (id: number | null) => void;
  onCancelOrder: (id: number) => void; 
  cancellingOrderId: number | null;
};

export default function RecentOrders({
  orders,
  loading,
  expandedOrder,
  setExpandedOrder,
  onCancelOrder,
  cancellingOrderId,
}: Props) {
  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-slate-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-500">No orders yet.</p>
      ) : (
        <>
          {orders.map((orderItem) => {
            const isOpen = expandedOrder === orderItem.id;
            console.log("ORDER LIST ITEM:", orderItem);

            const isDelivery = orderItem.order_type === "DELIVERY";

            return (
              <div
                key={orderItem.transactionnumber}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* HEADER */}
                <div
                  onClick={() =>
                    setExpandedOrder(isOpen ? null : orderItem.id)
                  }
                  className="flex cursor-pointer items-center justify-between px-5 py-4"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf7f4] text-[#2f8f83]">
                      <ShoppingBag className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-brand-blue">
                        {orderItem.transactionnumber}
                      </p>
                      <p className="text-sm text-slate-500">
                        {orderItem.date}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-brand-blue">
                        ₱{Number(orderItem.subtotal || 0).toLocaleString()}
                        </p>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        orderItem.status === "Delivered"
                          ? "bg-green-100 text-green-600"
                          : orderItem.status === "Pending"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {orderItem.status}
                    </span>

                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* EXPANDED CONTENT */}
                {isOpen && (
                  <div className="border-t bg-slate-50 px-5 py-4">
                    <p className="mb-3 text-xs font-semibold text-slate-400">
                      PRODUCTS
                    </p>

                    <div className="space-y-3">
                      {orderItem.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl bg-white p-3"
                        >
                          <div className="flex items-center gap-3">
                            {/* IMAGE */}
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-200">
                              {item.itemid?.image ? (
                                <img
                                  src={item.itemid.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {item.product_name || "Product"}
                                </p>
                              <p className="text-xs text-slate-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm font-semibold text-brand-blue">
                            ₱{item.subtotal}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-4 border-t pt-4">
                      <div className="space-y-2 text-sm">
                        {/* SUBTOTAL */}
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span>
                            ₱{orderItem.subtotal?.toLocaleString?.() || 0}
                          </span>
                        </div>

                        {/* ✅ DELIVERY CONDITION */}
                        {isDelivery ? (
                          <p className="text-xs text-[#3a9688]">
                            Delivery fee is paid directly to the rider upon delivery.
                          </p>
                        ) : (
                          <div className="flex justify-between text-green-600">
                            <span>Pickup</span>
                            <span>Free</span>
                          </div>
                        )}

                        {/* TOTAL */}
                        <div className="flex justify-between font-semibold text-brand-blue border-t pt-2">
                          <span>Total</span>
                          <span>₱{Number(orderItem.subtotal || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* ACTION */}
                      {["Pending", "Processing"].includes(orderItem.status) && (
                        <div className="mt-4 flex justify-end">
                          <button
                            disabled={cancellingOrderId === orderItem.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelOrder(orderItem.id);
                            }}
                            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                              cancellingOrderId === orderItem.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            {cancellingOrderId === orderItem.id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}