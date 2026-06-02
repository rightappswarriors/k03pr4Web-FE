"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Bell,
  Check,
  Tag,
  Star,
  AlertTriangle,
  Trash2,
} from "lucide-react";

type Notification = {
  id: number;
  title: string;
  message: string;
  createdat: string;
  type: string;
  isread: boolean;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/?orgId=1`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isread).length;

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return (
          <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
            <Bell className="text-blue-600" size={16} />
          </div>
        );
      case "sale":
        return (
          <div className="bg-green-100 p-2 sm:p-3 rounded-full">
            <Tag className="text-green-600" size={16} />
          </div>
        );
      case "review":
        return (
          <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
            <Star className="text-yellow-600" size={16} />
          </div>
        );
      case "stock":
        return (
          <div className="bg-red-100 p-2 sm:p-3 rounded-full">
            <AlertTriangle className="text-red-600" size={16} />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 sm:p-3 rounded-full">
            <Bell size={16} />
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
      <Header />

      <section className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">

        {/* 🔔 HEADER */}
        <div className="flex flex-col gap-4 mb-6">

          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="flex items-center gap-3">
              <Bell className="text-green-600 shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold">
                Notifications
              </h1>

              <span className="bg-gray-100 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                {unreadCount} unread
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

              <button className="
                inline-flex justify-center items-center gap-2
                w-full sm:w-auto
                px-4 py-2 rounded-xl
                border border-gray-200 bg-white
                text-gray-800 text-sm font-medium
                shadow-sm transition-all

                hover:bg-gray-50 hover:border-gray-300
                active:scale-95
              ">
                <Check size={16} />
                Mark all read
              </button>

              <button className="
                inline-flex justify-center items-center gap-2
                w-full sm:w-auto
                px-4 py-2 rounded-xl
                border border-red-200 bg-white
                text-red-600 text-sm font-medium
                shadow-sm transition-all

                hover:bg-red-50 hover:border-red-300
                active:scale-95
              ">
                <Trash2 size={16} />
                Clear all
              </button>

            </div>
          </div>
        </div>

        {/* 🔥 TABS (MOBILE SCROLLABLE) */}
        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-xl">

            {[
              { key: "all", label: "All" },
              { key: "order", label: "Orders" },
              { key: "sale", label: "Promos" },
              { key: "review", label: "Reviews" },
              { key: "stock", label: "Stock" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap font-medium transition
                  ${
                    activeTab === tab.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}

          </div>
        </div>

        {/* 🔹 LIST */}
        <div className="space-y-3 sm:space-y-4">

          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
              <Bell size={32} className="mb-3 opacity-50" />
              <p className="text-sm sm:text-base">
                No notifications yet
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className="
                  flex gap-3
                  sm:gap-4
                  border border-gray-200
                  rounded-xl
                  p-3 sm:p-4
                  bg-white
                  hover:shadow-md
                  transition
                "
              >
                {getIcon(n.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">

                    <p className="font-semibold text-sm sm:text-base text-gray-800 leading-snug wrap-break-word">
                      {n.title}
                      {!n.isread && (
                        <span className="ml-2 w-2 h-2 bg-green-500 inline-block rounded-full" />
                      )}
                    </p>

                    <Trash2
                      className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
                      size={16}
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mt-1 wrap-break-word">
                    {n.message}
                  </p>

                  <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
                    {new Date(n.createdat).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}

        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  );
}