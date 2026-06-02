"use client";

import Link from "next/link";
import { ShoppingCart, User, LogOut, Sparkles } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { useAnimationStore } from "@/store/useAnimationStore";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "@/components/NotificationDropdown";

type LoggedInUser = {
  fullName?: string;
  full_name?: string;
  email?: string;
};

export default function Navbar() {
  const router = useRouter();

  const count = useCart((state) => state.count);
  const setCount = useCart((state) => state.setCount);

  const isFlying = useAnimationStore((state) => state.isFlying);
  const setEndCoords = useAnimationStore((state) => state.setEndCoords);

  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const desktopProfileRef = useRef<HTMLDivElement>(null);

  const mobileCartIconRef = useRef<HTMLButtonElement>(null);
  const desktopCartIconRef = useRef<HTMLButtonElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleCartClick = () => {
    const user = localStorage.getItem("loggedInUser");

    if (!user) {
      localStorage.setItem("redirect_after_login", "/cart");
      router.push("/login");
      return;
    }

    router.push("/cart");
  };

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      setLoggedInUser(JSON.parse(user));
    } else {
      setLoggedInUser(null);
    }
  }, []);

  useEffect(() => {
    const syncCartCount = async () => {
      const token = localStorage.getItem("access");

      if (!token || !API_URL) {
        setCount(0);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/cart/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("loggedInUser");
          setLoggedInUser(null);
          setCount(0);
          return;
        }

        if (!res.ok) {
          setCount(0);
          return;
        }

        const data = await res.json();

        const totalCount =
          typeof data.total_quantity === "number"
            ? data.total_quantity
            : Array.isArray(data.items)
            ? data.items.reduce(
                (sum: number, item: { quantity: number }) =>
                  sum + Number(item.quantity || 0),
                0
              )
            : 0;

        setCount(totalCount);
      } catch (error) {
        console.error("Error syncing cart count:", error);
        setCount(0);
      }
    };

    syncCartCount();

    const handleStorageChange = () => {
      const user = localStorage.getItem("loggedInUser");

      if (user) {
        setLoggedInUser(JSON.parse(user));
      } else {
        setLoggedInUser(null);
        setCount(0);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [API_URL, setCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      const clickedOutsideMobile =
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(target);

      const clickedOutsideDesktop =
        desktopProfileRef.current &&
        !desktopProfileRef.current.contains(target);

      if (clickedOutsideMobile && clickedOutsideDesktop) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const measureCart = () => {
      const mobileEl = mobileCartIconRef.current;
      const desktopEl = desktopCartIconRef.current;

      const isActuallyVisible = (el: HTMLElement | null) => {
        if (!el) return false;

        const rect = el.getBoundingClientRect();

        return el.offsetParent !== null && rect.width > 0 && rect.height > 0;
      };

      let activeEl: HTMLElement | null = null;

      if (isActuallyVisible(mobileEl)) {
        activeEl = mobileEl;
      } else if (isActuallyVisible(desktopEl)) {
        activeEl = desktopEl;
      }

      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        setEndCoords(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    };

    measureCart();

    const timeout = setTimeout(measureCart, 50);

    window.addEventListener("resize", measureCart);
    window.addEventListener("scroll", measureCart);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", measureCart);
      window.removeEventListener("scroll", measureCart);
    };
  }, [setEndCoords]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setCount(0);
    setIsProfileOpen(false);
    router.push("/login");
  };

  const displayName =
    loggedInUser?.fullName ||
    loggedInUser?.full_name ||
    loggedInUser?.email ||
    "Profile";

  return (
    <header className="sticky top-0 z-50 border-b border-[#1f5f56] bg-[#1f5f56] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/home" className="flex shrink-0 items-center gap-2">
            <img
              src="/img/white_logo.png"
              alt="Kompra.ph"
              className="h-10 w-auto sm:h-12"
            />

            <span className="font-serif text-lg font-bold tracking-tight text-white sm:text-2xl">
              Kompra<span className="text-[#b7e4d8]">.ph</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <div className="relative">
              <motion.div
                animate={isFlying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  ref={mobileCartIconRef as any}
                  type="button"
                  onClick={handleCartClick}
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#b7e4d8] hover:bg-white/10 hover:text-white"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </motion.div>

              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="mobile-cart-badge"
                    initial={{ scale: 0 }}
                    animate={isFlying ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    className="pointer-events-none absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    {count > 99 ? "99+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {loggedInUser ? (
              <div className="relative" ref={mobileProfileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="inline-flex max-w-40 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
                >
                  <User size={18} />
                  <span className="truncate">{displayName}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full z-9999 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-gray-100"
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-[#de922f] hover:text-white"
              >
                <User size={18} />
                <span className="hidden xs:inline">Login</span>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-1 md:flex-row md:items-center md:justify-end">
          <div className="w-full md:mx-3 md:max-w-md lg:max-w-lg">
            <div className="relative w-full">
              <SearchBar />
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/products"
              className="font-medium text-[#b7e4d8] hover:text-white"
            >
              Products
            </Link>

            <Link
              href="/stores"
              className="font-medium text-[#b7e4d8] hover:text-white"
            >
              Stores
            </Link>

            <Link
              href="/ai"
              className="inline-flex items-center gap-1.5 font-medium text-[#b7e4d8] hover:text-white"
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Link>

           <div className="flex items-center h-10">
              <NotificationDropdown />
            </div>

            <div className="relative">
              <motion.div
                animate={isFlying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  ref={desktopCartIconRef as any}
                  type="button"
                  onClick={handleCartClick}
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#b7e4d8] hover:bg-white/10 hover:text-white"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </motion.div>

              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="desktop-cart-badge"
                    initial={{ scale: 0 }}
                    animate={isFlying ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    className="pointer-events-none absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white ring-2 ring-white"
                  >
                    {count > 99 ? "99+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {loggedInUser ? (
              <div className="relative" ref={desktopProfileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#b7e4d8]/30 bg-[#b7e4d8]/10 px-4 py-2 text-sm font-medium text-[#b7e4d8]"
                >
                  <User size={18} />
                  <span className="max-w-35 truncate">{displayName}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-gray-100"
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[#b7e4d8]/30 bg-[#b7e4d8]/10 px-4 py-2 text-sm font-medium text-[#b7e4d8]"
              >
                <User size={18} />
                Login
              </Link>
            )}
          </nav>

          <div className="flex items-center justify-center gap-5 border-t border-slate-200 pt-2 text-sm md:hidden">
            <Link
              href="/products"
              className="font-medium text-[#b7e4d8] hover:text-white"
            >
              Products
            </Link>

            <Link
              href="/stores"
              className="font-medium text-[#b7e4d8] hover:text-white"
            >
              Stores
            </Link>

            <Link
              href="/ai"
              className="font-medium text-[#b7e4d8] hover:text-white"
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Link>


            <NotificationDropdown />

          </div>
        </div>
      </div>
    </header>
  );
}