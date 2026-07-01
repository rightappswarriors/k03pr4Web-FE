"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Loader2, Mail, Store, Truck, User } from "lucide-react";
import AuthShowcase from "@/components/auth/AuthShowcase";
import OTPModal from "@/components/ui/OTPModal";

export default function LoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const handleVerifyOTP = async (otp: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch(`${API_URL}/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, otp }),
    });

    if (response.ok) {
      setShowVerification(false);
      setError("Email verified. Please sign in again.");
      return;
    }

    throw new Error("Invalid code");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
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
          email: normalizedEmail,
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
        if (data.needs_verification) {
          setDevOtp(data.dev_otp || "");
          setShowVerification(true);
          setError("Please verify your email before logging in.");
          return;
        }

        setError(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ee] lg:flex">
      <AuthShowcase />
      <OTPModal
        email={email}
        isOpen={showVerification}
        devOtp={devOtp}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerifyOTP}
      />

      <main className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <img src="/img/green_logo.png" alt="Kompra.ph" className="h-12 w-auto" />
          </div>

          <section className="rounded-[1.75rem] border border-[#ded8cc] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
                Welcome back
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#10231f]">
                Sign in to Kompra
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#66706b]">
                Access your account, saved carts, and marketplace activity.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-12 w-full rounded-xl border bg-[#fbfaf6] pl-11 pr-4 text-sm text-[#10231f] outline-none transition ${
                      error
                        ? "border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-[#ded8cc] focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#10231f]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-12 w-full rounded-xl border bg-[#fbfaf6] pl-11 pr-4 text-sm text-[#10231f] outline-none transition ${
                      error
                        ? "border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-[#ded8cc] focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10"
                    }`}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2f8f83] text-sm font-bold text-white transition hover:bg-[#26776d] disabled:cursor-not-allowed disabled:opacity-70"
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

            <p className="mt-6 text-center text-sm text-[#66706b]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#2f8f83] hover:underline"
              >
                Sign Up
              </Link>
            </p>

            <div className="mt-7">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#ded8cc]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[13px] text-[#8a938c]">
                    Register as a business partner
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href="https://portal.kompra.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#ded8cc] bg-[#fbfaf6] px-4 py-3 text-sm font-bold text-[#10231f] transition hover:border-[#de922f] hover:bg-white"
                >
                  <Store className="h-4 w-4" />
                  Store Seller
                </a>

                <a
                  href="https://portal.kompra.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#ded8cc] bg-[#fbfaf6] px-4 py-3 text-sm font-bold text-[#10231f] transition hover:border-[#de922f] hover:bg-white"
                >
                  <Truck className="h-4 w-4" />
                  B2B Supplier
                </a>
              </div>
            </div>

            <Link
              href="/"
              className="mt-5 block text-center text-sm font-semibold text-[#66706b] hover:text-[#2f8f83] lg:hidden"
            >
              Back to marketplace
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
