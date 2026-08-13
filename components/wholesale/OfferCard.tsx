"use client";

import { Package, Calendar, FileText, Check, X } from "lucide-react";
import type { NegotiationOffer } from "@/types/wholesale";

interface OfferCardProps {
  offer: NegotiationOffer;
  isLatest?: boolean;
  onAccept?: (offerId: string) => void;
  onCounter?: (offer: NegotiationOffer) => void;
  onReject?: (offerId: string) => void;
}

export default function OfferCard({
  offer,
  isLatest = false,
  onAccept,
  onCounter,
  onReject,
}: OfferCardProps) {
  const isSupplierOffer = offer.senderType === "SUPPLIER";
  const canAccept = isLatest && isSupplierOffer && offer.status === "PENDING";

  return (
    <div className="my-2 max-w-[80%] rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-500">
            {isSupplierOffer ? "Supplier Offer" : "Your Offer"}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            offer.status === "ACCEPTED"
              ? "bg-emerald-100 text-emerald-700"
              : offer.status === "REJECTED"
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {offer.status === "PENDING" && (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-slate-500" />
            </span>
          )}
          {offer.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <Package className="size-4 text-slate-400 mt-0.5" />
          <div>
            <span className="text-xs text-slate-500">Quantity</span>
            <p className="font-medium text-slate-900">{offer.quantity} pcs</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-xs text-slate-500">Supplier Price</span>
          <p className="font-medium text-slate-900">
            ₱{offer.unitPrice.toLocaleString()}
          </p>
        </div>

        {offer.deliveryDate && (
          <div className="flex items-start gap-2">
            <Calendar className="size-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-xs text-slate-500">Delivery</span>
              <p className="font-medium text-slate-900">
                {new Date(offer.deliveryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {offer.notes && (
          <div className="flex items-start gap-2">
            <FileText className="size-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-xs text-slate-500">Notes</span>
              <p className="text-sm text-slate-700">{offer.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-right text-xs text-slate-400">
        {new Date(offer.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Action buttons — only shown for the single most recent offer overall,
          and only while it's still a pending supplier offer awaiting your response. */}
      {canAccept && (
        <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
          <button
            onClick={() => onAccept?.(offer.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Check className="size-4" />
            Accept
          </button>
          <button
            onClick={() => onCounter?.(offer)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Counter Offer
          </button>
          <button
            onClick={() => onReject?.(offer.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <X className="size-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}