"use client";

import { useState } from "react";
import { X, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

interface OTPModalProps {
  email: string;
  isOpen: boolean;
  devOtp?: string;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
}

export default function OTPModal({ email, isOpen, devOtp, onClose, onVerify }: OTPModalProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false); // New state for animation
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await onVerify(otp);
      // Trigger success animation
      setIsVerified(true);
      // Auto-close after 2 seconds so they can see the animation
      setTimeout(() => {
        onClose();
        setIsVerified(false); // Reset for next time
      }, 2000);
    } catch (err) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await fetch(`${API_URL}/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to resend the code. Please try again.");
        return;
      }

      setOtp("");
      setMessage(
        data.dev_otp
          ? `Local dev OTP: ${data.dev_otp}`
          : "A new verification code was sent to your email."
      );
    } catch (err) {
      setError("Unable to connect to the server. Please check if the backend is running.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all">
        {/* Close Button - Hidden during success animation */}
        {!isVerified && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          {isVerified ? (
            /* --- SUCCESS ANIMATION SECTION --- */
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
                {/* Pulsing Outer Ring */}
                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-10 w-10 text-green-500 animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Verified!</h3>
              <p className="mt-2 text-sm text-slate-500">Your account is now active.</p>
            </div>
          ) : (
            /* --- ORIGINAL MODAL CONTENT --- */
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2f8f83]/10">
                <ShieldCheck className="h-8 w-8 text-[#2f8f83]" />
              </div>

              <h3 className="text-2xl font-bold text-slate-800">Verify your email</h3>
              <p className="mt-2 text-sm text-slate-500 px-4">
                We've sent a 6-digit verification code to <span className="font-semibold text-slate-700">{email}</span>.
              </p>

              {devOtp && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Local dev OTP: <span className="font-bold tracking-widest">{devOtp}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 w-full">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  disabled={loading}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-4 text-center text-3xl font-bold tracking-[0.5em] text-[#1e3a8a] outline-none transition focus:border-[#2f8f83] focus:bg-white"
                />

                {error && (
                  <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
                )}

                {message && (
                  <p className="mt-3 text-sm font-medium text-[#2f8f83]">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#2f8f83] py-4 text-lg font-bold text-white shadow-lg shadow-[#2f8f83]/20 transition hover:bg-[#26776d] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </button>
              </form>

              <button 
                type="button"
                disabled={resending}
                className="mt-6 text-sm font-semibold text-[#2f8f83] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleResend}
              >
                {resending ? "Sending new code..." : "Didn't get the code? Resend"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
