"use client";

import { Package, Calendar, User, Clock, Tag, MapPin } from "lucide-react";
import type { ConversationDetail } from "@/types/wholesale";

interface ConversationSidebarProps {
  conversation: ConversationDetail;
}

export default function ConversationSidebar({
  conversation,
}: ConversationSidebarProps) {
  const rfq = conversation.rfq;
  const supplier = conversation.supplier;
  const product = conversation.product;

  return (
    <aside className="w-full overflow-y-auto border-l border-slate-200 bg-slate-50/50 p-6 lg:w-80 lg:max-w-xs">
      <div className="space-y-6">
        {/* RFQ Details */}
        {rfq && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-slate-500">
              RFQ Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                <span className="text-xs text-slate-500">RFQ Number</span>
                <span className="text-xs font-mono font-semibold text-slate-900">
                  {rfq.rfqNumber}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                <span className="text-xs text-slate-500">Status</span>
                <span className="text-xs font-medium text-slate-900">
                  {rfq.status}
                </span>
              </div>
              {rfq.quantity != null && (
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="text-xs text-slate-500">Quantity</span>
                  <span className="text-xs font-medium text-slate-900">
                    {rfq.quantity}
                  </span>
                </div>
              )}
              {rfq.targetUnitPrice != null && (
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="text-xs text-slate-500">Target Price</span>
                  <span className="text-xs font-medium text-slate-900">
                    ₱{rfq.targetUnitPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {rfq.expectedDeliveryDate && (
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="text-xs text-slate-500">Delivery Date</span>
                  <span className="text-xs font-medium text-slate-900">
                    {new Date(rfq.expectedDeliveryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {rfq.acceptedPrice != null && (
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="text-xs text-slate-500">Accepted Price</span>
                  <span className="text-xs font-medium text-emerald-700">
                    ₱{rfq.acceptedPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

          {/* Supplier Information */}
          {supplier && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase text-slate-500">
                Supplier Information
              </h3>
              <div className="rounded-lg bg-white p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    {supplier.profilePhoto ? (
                      <img
                        src={supplier.profilePhoto}
                        alt={supplier.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <User className="size-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{supplier.name}</p>
                    {supplier.verified && (
                      <span className="text-xs text-emerald-700">
                        ✓ Verified Supplier
                      </span>
                    )}
                  </div>
                </div>
                {supplier.location && (
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="size-3 text-slate-400 mt-0.5" />
                    <span>{supplier.location}</span>
                  </div>
                )}
                {supplier.rating != null && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs text-slate-600">
                      Rating: {supplier.rating}/5
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product */}
          {product && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase text-slate-500">
                Product
              </h3>
              <div className="rounded-lg bg-white p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="size-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                    )}
                  </div>
                </div>
                {product.moq != null && (
                  <div className="flex items-center justify-between py-1 text-xs">
                    <span className="text-slate-500">MOQ</span>
                    <span className="font-medium text-slate-900">
                      {product.moq} {product.unit || "pcs"}
                    </span>
                  </div>
                )}
                {product.availableQty != null && (
                  <div className="flex items-center justify-between py-1 text-xs">
                    <span className="text-slate-500">Inventory</span>
                    <span className="font-medium text-slate-900">
                      {product.availableQty} units
                    </span>
                  </div>
                )}
                {product.leadTime && (
                  <div className="flex items-center justify-between py-1 text-xs">
                    <span className="text-slate-500">Lead Time</span>
                    <span className="font-medium text-slate-900">
                      {product.leadTime}
                    </span>
                  </div>
                )}
                {product.priceTiers && product.priceTiers.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-slate-500">
                      Tier Pricing
                    </p>
                    {product.priceTiers.map((tier, i) => (
                      <div
                        key={i}
                        className="flex justify-between rounded-lg bg-slate-50 px-2 py-1 text-xs"
                      >
                        <span className="text-slate-600">
                          {tier.maxQty
                            ? `${tier.minQty}-${tier.maxQty} pcs`
                            : `${tier.minQty}+ pcs`}
                        </span>
                        <span className="font-medium text-slate-900">
                          ₱{tier.unitPrice.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Negotiation */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-slate-500">
              Current Negotiation
            </h3>
            <div className="rounded-lg bg-white p-4">
              {rfq?.acceptedPrice != null ? (
                <div className="text-center">
                  <p className="text-xs text-slate-500">Accepted Offer</p>
                  <p className="mt-1 text-lg font-bold text-emerald-700">
                    ₱{rfq.acceptedPrice.toLocaleString()}
                  </p>
                  {rfq.acceptedQuantity != null && (
                    <p className="text-xs text-slate-600">
                      {rfq.acceptedQuantity} units
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="size-3" />
                    <span>Negotiation in progress</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Tag className="size-3" />
                    <span>Status: {rfq?.status || "Negotiating"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </aside>
  );
}
