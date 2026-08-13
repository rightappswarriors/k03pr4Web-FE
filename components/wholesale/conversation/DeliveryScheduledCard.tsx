"use client";

import { Truck, Calendar, MapPin, User } from "lucide-react";
import { formatDateSafe, formatTimeSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

interface DeliveryScheduledCardProps {
  message: ConversationMessage;
  onViewTracking?: (url: string) => void;
}

export default function DeliveryScheduledCard({ message, onViewTracking }: DeliveryScheduledCardProps) {
  const meta = message.metadata ?? {};

  const scheduledDate = meta.scheduledDate ?? meta.deliveryDate ?? message.createdAt;
  const carrier = meta.carrier ?? "Standard Courier";
  const trackingNumber = meta.trackingNumber ?? null;
  const trackingUrl = meta.trackingUrl ?? null;
  const estimatedDays = meta.estimatedDays ?? null;
  const items = meta.lineItems ?? [];

  return (
    <div className="my-2 max-w-[90%] rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Truck className="size-5 text-blue-700" />
        <h3 className="text-sm font-semibold text-blue-900">Delivery Scheduled</h3>
      </div>

      <div className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Carrier</span>
          <p className="font-medium text-slate-900">{carrier}</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-slate-400" />
          <div>
            <span className="text-xs text-slate-500">Scheduled Date</span>
            <p className="font-medium text-slate-900">
              {formatDateSafe(scheduledDate, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {estimatedDays && (
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Estimated Delivery</span>
            <p className="font-medium text-slate-900">
              {estimatedDays} {parseInt(estimatedDays) === 1 ? "day" : "days"}
            </p>
          </div>
        )}

        {trackingNumber && (
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500">Tracking Number</span>
              <p className="font-medium text-slate-900 font-mono">{trackingNumber}</p>
            </div>
            {trackingUrl && onViewTracking && (
              <button
                onClick={() => onViewTracking(trackingUrl)}
                className="text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                Track
              </button>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-2 space-y-1">
            <span className="text-xs text-slate-500">Items ({items.length})</span>
            {items.slice(0, 3).map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-600">{item.name ?? item.label}</span>
                <span className="text-slate-900">{item.qty ?? item.quantity} {item.unit ?? ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-400">
        {formatTimeSafe(message.createdAt)}
      </p>
    </div>
  );
}
