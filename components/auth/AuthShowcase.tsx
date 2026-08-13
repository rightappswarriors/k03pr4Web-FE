import Link from "next/link";
import { CheckCircle2, Store, Truck } from "lucide-react";

type AuthShowcaseProps = {
  variant?: "customer" | "seller" | "supplier";
};

export default function AuthShowcase({
  variant = "customer",
}: AuthShowcaseProps) {
  const isSeller = variant === "seller";
  const isSupplier = variant === "supplier";

  const title = isSeller
    ? "Open a store without the usual clutter."
    : isSupplier
    ? "Supply verified stores from one clean workflow."
    : "A calmer way to shop local stores.";

  const copy = isSeller
    ? "Create your storefront, publish products, and manage demand from a marketplace built around branch-ready commerce."
    : isSupplier
    ? "Reach more partner stores, organize product availability, and keep buyer communication in one place."
    : "Sign in to browse verified stores, track branch availability, and keep checkout simple.";

  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#1f5f56] px-10 text-white lg:flex lg:w-1/2">
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <div className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#2f8f83]/35 blur-3xl" />
      <div className="absolute -bottom-24 right-8 h-80 w-80 rounded-full bg-[#f97316]/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col justify-between py-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/img/white_logo.png"
              alt="Kompra.ph"
              className="h-11 w-auto"
            />
            <div>
              <p className="text-xl font-black tracking-tight">
                Kompra<span className="text-[#b7e4d8]">.ph</span>
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b7e4d8]/70">
                Local marketplace
              </p>
            </div>
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/8">
            {isSeller ? (
              <Store className="h-5 w-5 text-[#b7e4d8]" />
            ) : isSupplier ? (
              <Truck className="h-5 w-5 text-[#b7e4d8]" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-[#b7e4d8]" />
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b7e4d8]">
            Secure marketplace access
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-[1.02] tracking-tight">
            {title}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/75">
            {copy}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["Verified", "stores"],
              ["Clear", "stock"],
              ["Simple", "checkout"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/12 bg-white/8 p-4"
              >
                <p className="text-lg font-black">{value}</p>
                <p className="mt-1 text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="text-sm font-semibold text-white/70 transition hover:text-white"
        >
          Back to marketplace
        </Link>
      </div>
    </aside>
  );
}
