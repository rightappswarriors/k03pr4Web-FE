"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Loader2, Store, Truck } from "lucide-react";
import AuthShowcase from "@/components/auth/AuthShowcase";

export default function LoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            id: data.user.id,
            fullName: data.user.full_name,
            email: data.user.email,
            phone: data.user.contact_number,
            gender: data.user.gender,
            birthday: data.user.date_of_birth,
          })
        );

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        const redirectPath = localStorage.getItem("redirect_after_login");

        if (redirectPath) {
          localStorage.removeItem("redirect_after_login");
          router.push(redirectPath);
        } else {
          router.push("/home");
        }
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:flex">
      <AuthShowcase />

      <div className="flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 lg:w-1/2 lg:px-10">
        <div className="w-full max-w-sm">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="text-2xl font-bold text-brand-blue">Welcome Back</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Log in to continue your shopping experience.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition ${
                      error
                        ? "border-red-500 focus:ring-red-200"
                        : "border-slate-300 focus:border-[#2f8f83] focus:ring-[#2f8f83]/25"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition ${
                      error
                        ? "border-red-500 focus:ring-red-200"
                        : "border-slate-300 focus:border-[#2f8f83] focus:ring-[#2f8f83]/25"
                    }`}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-[#2f8f83] py-2.5 text-sm font-semibold text-white transition hover:bg-[#26776d] disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#2f8f83] hover:underline"
              >
                Sign Up
              </Link>
            </p>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[13px] text-slate-500">
                    Register as a business partner
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/register/store-seller"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-[#de922f] hover:bg-[#de922f] hover:text-white"
                >
                  <Store className="h-4 w-4" />
                  Store Seller
                </Link>

                <Link
                  href="/register/supplier"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-[#de922f] hover:bg-[#de922f] hover:text-white"
                >
                  <Truck className="h-4 w-4" />
                  B2B Supplier
                </Link>
              </div>
            </div>

            <Link
              href="/"
              className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-700 lg:hidden"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}