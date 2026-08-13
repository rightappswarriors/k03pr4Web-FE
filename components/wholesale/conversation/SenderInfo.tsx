"use client";

import { User } from "lucide-react";
import { resolveSenderName, formatDateSafe, formatTimeSafe } from "@/lib/financial";
import type { ConversationMessage, NegotiationOffer } from "@/types/wholesale";

interface SenderInfoProps {
  message?: ConversationMessage;
  offer?: NegotiationOffer;
  senderType?: "AGENT" | "SUPPLIER";
  className?: string;
}

export default function SenderInfo({
  message,
  offer,
  senderType: explicitSenderType,
  className = "",
}: SenderInfoProps) {
  // Resolve sender info with priority: fullName → orgName → email → role label
  let fullName: string | null = null;
  let orgName: string | null = null;
  let email: string | null = null;
  let senderType = explicitSenderType;

  if (message?.senderAgent?.fullname || message?.senderOrg?.name) {
    fullName = message?.senderAgent?.fullname ?? null;
    orgName = message?.senderOrg?.name ?? null;
    email = message?.senderAgent?.email ?? null;
    senderType = message.senderRole;
  } else if (offer?.senderAgent?.fullname || offer?.senderOrg?.name) {
    fullName = offer?.senderAgent?.fullname ?? null;
    orgName = offer?.senderOrg?.name ?? null;
    senderType = offer.senderType;
  }

  // Fallback to message/offer embedded senderName
  if (!fullName && !orgName && !email) {
    if (message?.senderName) {
      // If the senderName is not "undefined" or "Unknown", use it
      if (message.senderName !== "undefined" && message.senderName !== "Unknown") {
        fullName = message.senderName;
      }
    }
    if (!fullName && offer?.senderName) {
      if (offer.senderName !== "undefined" && offer.senderName !== "Unknown") {
        fullName = offer.senderName;
      }
    }
  }

  const displayName = resolveSenderName({ fullName, organizationName: orgName, email, senderType });
  const createdAt = message?.createdAt ?? offer?.createdAt ?? null;

  const isAgent = senderType === "AGENT";

  return (
    <div className={`flex items-center gap-2 mb-1 ${className}`}>
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          isAgent ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        <User className="size-3" />
      </div>
      <span className="text-xs font-medium text-slate-600">{displayName}</span>
      {createdAt && (
        <span className="text-xs text-slate-400">
          {formatTimeSafe(createdAt)}
        </span>
      )}
    </div>
  );
}
