"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import AuthShowcase from "@/components/auth/AuthShowcase";
import OTPModal from "@/components/ui/OTPModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const fieldClass =
    "h-12 w-full rounded-xl border border-[#ded8cc] bg-[#fbfaf6] pl-11 pr-4 text-sm text-[#10231f] outline-none transition focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10";

  const handleVerifyOTP = async (otp: string) => {
    const response = await fetch(`${API_URL}/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
      router.push("/login?registered=true&verified=true");
    } else {
      throw new Error("Invalid code");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !fullName ||
      !normalizedEmail ||
      !contactNumber ||
      !gender ||
      !dateOfBirth ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (contactNumber.length !== 11) {
      setError("Contact number must be exactly 11 digits.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (dateOfBirth > today) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: normalizedEmail,
          contact_number: contactNumber,
          gender,
          date_of_birth: dateOfBirth,
          password,
          role: "CUSTOMER",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDevOtp(data.dev_otp || "");
        setIsModalOpen(true);
      } else if (data.email_delivery) {
        setError(
          Array.isArray(data.email_delivery)
            ? data.email_delivery[0]
            : data.email_delivery
        );
      } else if (data.email) {
        setError(
          Array.isArray(data.email)
            ? data.email[0]
            : "An account with this email already exists."
        );
      } else if (data.contact_number) {
        setError(
          Array.isArray(data.contact_number)
            ? data.contact_number[0]
            : "Invalid contact number format."
        );
      } else if (data.gender) {
        setError(
          Array.isArray(data.gender) ? data.gender[0] : "Invalid gender selected."
        );
      } else if (data.date_of_birth) {
        setError(
          Array.isArray(data.date_of_birth)
            ? data.date_of_birth[0]
            : "Invalid date of birth."
        );
      } else {
        setError("Registration failed. Please try again later.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ee] lg:flex">
      <AuthShowcase />

      <OTPModal
        email={email}
        isOpen={isModalOpen}
        devOtp={devOtp}
        onClose={() => setIsModalOpen(false)}
        onVerify={handleVerifyOTP}
      />

      <main className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-xl">
          <div className="mb-8 lg:hidden">
            <img src="/img/green_logo.png" alt="Kompra.ph" className="h-12 w-auto" />
          </div>

          <section className="rounded-[1.75rem] border border-[#ded8cc] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f8f83]">
                Customer account
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#10231f]">
                Create your Kompra account
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#66706b]">
                Set up your shopping profile and verify your email to continue.
              </p>
            </div>

            <form onSubmit={handleSignup} className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#10231f]">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#10231f]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#10231f]">
                    Contact number
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                    <input
                      type="tel"
                      required
                      placeholder="09123456789"
                      value={contactNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 11) setContactNumber(value);
                      }}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#10231f]">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-[#ded8cc] bg-[#fbfaf6] pl-4 pr-10 text-sm text-[#10231f] outline-none transition focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#10231f]">
                    Date of birth
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={fieldClass}
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
                      required
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#10231f]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938c]" />
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`h-12 w-full rounded-xl border bg-[#fbfaf6] pl-11 pr-4 text-sm text-[#10231f] outline-none transition ${
                        password !== confirmPassword && confirmPassword !== ""
                          ? "border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-[#ded8cc] focus:border-[#2f8f83] focus:bg-white focus:ring-4 focus:ring-[#2f8f83]/10"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2f8f83] text-sm font-bold text-white transition hover:bg-[#26776d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#66706b]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#2f8f83] hover:underline"
              >
                Log In
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
