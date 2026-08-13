"use client";

import { RFQ_STATUS_CONFIG, type RfqStatus } from "@/types/wholesale";

interface StatusBadgeProps {
  status: RfqStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = RFQ_STATUS_CONFIG[status] || RFQ_STATUS_CONFIG.SUBMITTED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${config.color} ${className}`}
    >
      <span className="relative flex size-1.5">
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex size-1.5 rounded-full ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
}