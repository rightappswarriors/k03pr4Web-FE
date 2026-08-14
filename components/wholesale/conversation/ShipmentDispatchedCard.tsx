"use client";

import { PackageCheck, Calendar, User, ExternalLink } from "lucide-react";
import { formatDateSafe, formatTimeSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

interface ShipmentDispatchedCardProps {
  message: ConversationMessage;
  onViewTracking?: (url: string) => void;
}

export default function ShipmentDispatchedCard({ message, onViewTracking }: ShipmentDispatchedCardProps) {
  const meta = message.metadata ?? {};

  const dispatchedAt = meta.dispatchedAt ?? meta.shipDate ?? message.createdAt;
  const trackingNumber = meta.trackingNumber ?? null;
  const trackingUrl = meta.trackingUrl ?? null;
  const carrier = meta.carrier ?? "Standard Courier";
  const driverName = meta.driverName ?? null;
  const driverContact = meta.driverContact ?? null;
  const deliveryDate = meta.deliveryDate ?? null;

  return (
    <div className="my-2 max-w-[90%] rounded-xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <PackageCheck className="size-5 text-indigo-700" />
        <h3 className="text-sm font-semibold text-indigo-900">Shipment Dispatched</h3>
      </div>

      <div className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Carrier</span>
          <p className="font-medium text-slate-900">{carrier}</p>
        </div>

        {trackingNumber && (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-500">Tracking Number</span>
              <p className="font-medium text-slate-900 font-mono">{trackingNumber}</p>
            </div>
            {trackingUrl && onViewTracking && (
              <button
                onClick={() => onViewTracking(trackingUrl)}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-800"
              >
                Track
                <ExternalLink className="size-3" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-slate-400" />
          <div>
            <span className="text-xs text-slate-500">Dispatched At</span>
            <p className="font-medium text-slate-900">
              {formatDateSafe(dispatchedAt, 'en-PH',{ year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {deliveryDate && (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-slate-400" />
            <div>
              <span className="text-xs text-slate-500">Estimated Delivery</span>
              <p className="font-medium text-slate-900">
                {formatDateSafe(deliveryDate, 'en-PH', { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        )}

        {driverName && (
          <div className="flex items-center gap-2">
            <User className="size-4 text-slate-400" />
            <div>
              <span className="text-xs text-slate-500">Driver</span>
              <p className="font-medium text-slate-900">{driverName}</p>
              {driverContact && <p className="text-xs text-slate-600">{driverContact}</p>}
            </div>
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-400">
        {formatTimeSafe(message.createdAt)}
      </p>
    </div>
  );
}
