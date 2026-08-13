"use client";

import { Package, User } from "lucide-react";
import { resolveSenderName, formatTimeSafe } from "@/lib/financial";
import type { ConversationMessage } from "@/types/wholesale";

export type MessageGroupPosition = "single" | "first" | "middle" | "last";

interface MessageEventCardProps {
  message: ConversationMessage;
  supplierName?: string;
  buyerName?: string;
  // Where this bubble sits within a run of consecutive same-sender messages.
  // Computed by the caller (page.tsx), which is the only place that actually
  // sees the full chronological sequence — a single card in isolation has no
  // way to know what came before or after it. Defaults to "single" so any
  // existing caller that doesn't pass this yet still renders correctly.
  position?: MessageGroupPosition;
}

// Messenger-style stacking: the outer corner of a group (top of the first
// bubble, bottom of the last) stays fully rounded; the seam side(s) where
// bubbles touch a same-sender neighbor get a much smaller radius instead of
// a hard 90° corner, so consecutive bubbles read as one flowing group rather
// than a stack of identical pills.
const CORNER_CLASSES: Record<MessageGroupPosition, string> = {
  single: "rounded-2xl",
  first: "rounded-t-2xl rounded-b-md",
  middle: "rounded-md",
  last: "rounded-t-md rounded-b-2xl",
};

export default function MessageEventCard({
  message,
  supplierName = "Supplier",
  buyerName = "You",
  position = "single",
}: MessageEventCardProps) {
  const isAgent = message.senderRole === "AGENT";
  const align = isAgent ? "justify-end" : "justify-start";
  const showHeader = position === "single" || position === "first";

  const displayName = resolveSenderName({
    fullName: message.senderAgent?.fullname ?? message.senderName ?? null,
    organizationName: message.senderOrg?.name ?? null,
    email: message.senderAgent?.email ?? null,
    senderType: message.senderRole,
  });

  const label = isAgent ? buyerName : supplierName;
  const effectiveName =
    displayName && displayName !== "Unknown" && displayName !== "undefined"
      ? displayName
      : label;

  return (
    <div className={`flex gap-3 ${align} ${position === "middle" || position === "last" ? "mt-1" : "mt-3"}`}>
      {!isAgent && (
        // Reserve the avatar column's width even when the avatar itself is
        // hidden for a grouped bubble, so every bubble in the group stays
        // aligned to the same left edge instead of shifting left.
        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
          {showHeader && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <User className="size-4" />
            </div>
          )}
        </div>
      )}
      <div
        className={`max-w-[70%] px-4 py-3 ${CORNER_CLASSES[position]} ${
          isAgent
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-slate-900"
        }`}
      >
        {showHeader && (
          <div className="flex items-center gap-2 mb-1">
            <User className="size-3" />
            <span className="text-xs font-medium">{effectiveName}</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.message}</p>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Package className="size-3" />
                <span>{att.replace("upload://", "")}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-1 text-right">
          <span className="text-xs opacity-70">
            {formatTimeSafe(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}