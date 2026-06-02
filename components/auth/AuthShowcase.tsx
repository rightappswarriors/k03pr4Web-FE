import Link from "next/link";
import { Store, Truck } from "lucide-react";

type AuthShowcaseProps = {
  variant?: "customer" | "seller" | "supplier";
};

export default function AuthShowcase({
  variant = "customer",
}: AuthShowcaseProps) {
  const isSeller = variant === "seller";
  const isSupplier = variant === "supplier";

  return (
    <div className="relative hidden min-h-screen overflow-hidden bg-[#2f8f83] px-10 text-white lg:flex lg:w-1/2 items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_45%)]" />
      <div className="absolute left-16 top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-20 right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 inline-flex items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30 px-6 py-4 max-w-fit">
          {isSeller ? (
            <Store className="h-10 w-10 text-white" />
          ) : isSupplier ? (
            <Truck className="h-10 w-10 text-white" />
          ) : (
            <img
              src="/img/white_logo.png"
              alt="Kompra.ph"
              className="h-28 w-auto object-contain drop-shadow-md"
            />
          )}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-serif font-bold tracking-tight">
          {isSeller
            ? "Sell on Kompra.ph"
            : isSupplier
            ? "Supply to Kompra.ph"
            : "Kompra.ph"}
        </h1>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-sm text-base leading-8 text-white/90 sm:text-lg">
          {isSeller
            ? "Open your online store and reach thousands of customers. Manage your products, track orders, and grow your business."
            : isSupplier
            ? "Partner with us to supply products to hundreds of stores across the Philippines. Grow your distribution network with Kompra.ph."
            : "Your one-stop marketplace for fresh, local products delivered right to your doorstep."}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 border-t border-white/20 pt-8 text-center">
          {isSeller ? (
            <>
              <div>
                <p className="text-3xl font-bold">0%</p>
                <p className="mt-1 text-sm text-white/80">Joining Fee</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="mt-1 text-sm text-white/80">Seller Support</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Fast</p>
                <p className="mt-1 text-sm text-white/80">Payouts</p>
              </div>
            </>
          ) : isSupplier ? (
            <>
              <div>
                <p className="text-3xl font-bold">50+</p>
                <p className="mt-1 text-sm text-white/80">Partner Stores</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Weekly</p>
                <p className="mt-1 text-sm text-white/80">Settlements</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Dedicated</p>
                <p className="mt-1 text-sm text-white/80">Account Mgr</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="mt-1 text-sm text-white/80">Products</p>
              </div>
              <div>
                <p className="text-3xl font-bold">50+</p>
                <p className="mt-1 text-sm text-white/80">Stores</p>
              </div>
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="mt-1 text-sm text-white/80">Users</p>
              </div>
            </>
          )}
        </div>

        {/* Back */}
        <Link
          href="/"
          className="mt-10 inline-block text-sm text-white/90 hover:underline"
        >
           ← Back to Home
        </Link>
      </div>
    </div>
  );
}