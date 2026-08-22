"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquare, FileText, Bell, X } from "lucide-react";
import { useNotifications } from "@/providers/NotificationProvider";

const DISPLAY_MS = 3_000;
const EXIT_MS = 250;

type NotificationKind = "message" | "success" | "rfq" | "default";

function getKind(title: string): NotificationKind {
  const t = title.toLowerCase();
  if (t.includes("message")) return "message";
  if (t.includes("accepted") || t.includes("created")) return "success";
  if (t.includes("rfq")) return "rfq";
  return "default";
}

const KIND_STYLES: Record<
  NotificationKind,
  { icon: typeof Bell; iconBg: string; iconColor: string; accent: string }
> = {
  message: { icon: MessageSquare, iconBg: "bg-blue-50", iconColor: "text-blue-600", accent: "bg-blue-500" },
  success: { icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", accent: "bg-emerald-500" },
  rfq: { icon: FileText, iconBg: "bg-amber-50", iconColor: "text-amber-600", accent: "bg-amber-500" },
  default: { icon: Bell, iconBg: "bg-slate-100", iconColor: "text-slate-600", accent: "bg-slate-400" },
};

export function FloatingNotificationBanner() {
  const { notifications, remove } = useNotifications();
  const router = useRouter();

  const visible = notifications.filter((n) => !(n.isRead ?? n.isread)).slice(0, 3);
  const [exitingIds, setExitingIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    const timers = visible.map((n) =>
      setTimeout(() => {
        setExitingIds((prev) => new Set(prev).add(n.id));
        setTimeout(() => remove(n.id), EXIT_MS);
      }, DISPLAY_MS)
    );
    return () => timers.forEach(clearTimeout);
  }, [visible, remove]);

  const dismiss = (id: string | number) => {
    setExitingIds((prev) => new Set(prev).add(id));
    setTimeout(() => remove(id), EXIT_MS);
  };


  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2.5">
      {visible.map((n, i) => {
        const { icon: Icon, iconBg, iconColor, accent } = KIND_STYLES[getKind(n.title)];
        const isExiting = exitingIds.has(n.id);
        return (
          <div
            key={n.id}
            style={{ transitionDelay: isExiting ? "0ms" : `${i * 60}ms` }}
            className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl bg-white p-3.5 pr-8 shadow-lg ring-1 ring-black/5 transition-all duration-300 ease-out ${isExiting ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"
              } animate-in fade-in slide-in-from-top-3`}
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
              <Icon className={`h-4.5 w-4.5 ${iconColor}`} strokeWidth={2} />
            </div>
            <button
              className="min-w-0 flex-1 text-left"
              onClick={() => n.deepLink && router.push(n.deepLink)}
            >
              <p className="truncate text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-slate-500">{n.message}</p>
            </button>
            <button
              aria-label="Dismiss"
              className="absolute right-2.5 top-2.5 rounded-full p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
              onClick={() => dismiss(n.id)}
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
}