"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  MessageSquare,
  Truck,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { useAgentAuth } from "@/hooks/useAgentAuth";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/wholesale/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/wholesale/products", icon: Package },
  { label: "Inbox", href: "/wholesale/inbox", icon: MessageSquare },
  { label: "My RFQs", href: "/wholesale/rfqs", icon: FileText },
  { label: "My Orders", href: "/wholesale/orders", icon: ShoppingCart },
  { label: "Suppliers", href: "/wholesale/suppliers", icon: Truck },
  { label: "Settings", href: "/wholesale/settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAgentAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#2f8f83] shadow-md hover:bg-gray-50 md:hidden"
        aria-label="Open dashboard menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-100vh w-64 overflow-y-auto bg-white shadow-lg transition-transform duration-300 md:translate-x-0 md:static md:z-auto md:w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/**<!--<div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>-->**/}

        <nav className="py-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#e6f4f1] text-[#2f8f83]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-[#2f8f83]" : "text-slate-400"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-slate-200 pt-2">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
