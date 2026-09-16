"use client";



import { useState, useEffect } from "react";

import { CreditCard, Truck, FileText, Shield, Package } from "lucide-react";

import Header from "@/components/layout/Header";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";

import Link from "next/link";

import { wholesaleApi } from "@/services/wholesale.service";

import type { WholesaleCartValidation } from "@/types/wholesale";



export default function WholesaleCheckoutPage() {

  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "review">("cart");

  const [cart, setCart] = useState<WholesaleCartValidation | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  // Load and revalidate the real server-side cart on mount — replaces the
  // old localStorage-only cart with the persistent, agent-scoped one.
  // validateCart (not getCart) so price/tier drift and availability issues
  // are caught and surfaced before the buyer proceeds to shipping/payment.
  const loadCart = async () => {
    setCartLoading(true);
    setCartError(null);
    try {
      const data = await wholesaleApi.validateCart();
      setCart(data);
    } catch (e) {
      console.error("Failed to load cart:", e);
      setCartError("Couldn't load your cart. Please try again.");
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (lineId: string, quantity: number) => {
    try {
      await wholesaleApi.updateCartLine(lineId, quantity);
      const data = await wholesaleApi.validateCart();
      setCart(data);
    } catch (e) {
      console.error("Failed to update quantity:", e);
    }
  };

  const handleRemoveLine = async (lineId: string) => {
    try {
      await wholesaleApi.removeCartLine(lineId);
      const data = await wholesaleApi.validateCart();
      setCart(data);
    } catch (e) {
      console.error("Failed to remove line:", e);
    }
  };

  const totalAmount = cart?.total ?? 0;
  const hasInvalidLines = cart?.valid === false;
  const hasPriceChanges = (cart?.lineErrors?.some((e) => e.priceChanged) ?? false);

  const [shippingInfo, setShippingInfo] = useState({

    name: "",

    address: "",

    city: "",

    province: "",

    contact: "",

    notes: "",

  });

  const [paymentMethod, setPaymentMethod] = useState<"bank" | "lc" | "trade-assurance">("bank");



  return (

    <AgentAuthProvider>
      <main className="min-h-screen bg-[#f7f7f5]">

        <Header wholesale />



        <div className="container-shell py-8">

          <div className="mb-6">

            <h1 className="text-2xl font-bold text-slate-900">Wholesale Checkout</h1>

            <div className="mt-4 flex items-center gap-4">

              {(["cart", "shipping", "payment", "review"] as const).map((s, i) => (

                <div key={s} className="flex items-center">

                  <div

                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step === s || (i < ["cart", "shipping", "payment", "review"].indexOf(step))

                      ? "bg-emerald-600 text-white"

                      : "bg-slate-200 text-slate-600"

                      }`}

                  >

                    {i + 1}

                  </div>

                  <span className="ml-2 text-sm capitalize">{s}</span>

                  {i < 3 && <div className="mx-4 h-0.5 w-12 bg-slate-300" />}

                </div>

              ))}

            </div>

          </div>



          {/* Step 1: Cart Review */}

          {step === "cart" && (

            <div className="rounded-xl bg-white p-6">

              <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>

              {cartLoading ? (

                <div className="space-y-4">

                  <div className="h-16 bg-slate-200 rounded animate-pulse"></div>

                </div>

              ) : cartError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{cartError}</p>
                  <button onClick={loadCart} className="mt-4 text-emerald-600 hover:underline">
                    Try again
                  </button>
                </div>
              ) : !cart || cart.suppliers.length === 0 ? (
                <div className="text-center py-8">

                  <p className="text-slate-600">Your cart is empty.</p>

                  <Link href="/wholesale/products" className="mt-4 inline-block text-emerald-600 hover:underline">

                    Continue shopping

                  </Link>

                </div>

              ) : (

                <div className="space-y-6">
                  {cart.suppliers.map((supplier) => (
                    <div key={supplier.supplierId} className="rounded-lg border border-slate-200 p-4">
                      <h3 className="mb-3 font-semibold text-slate-900">{supplier.supplierName}</h3>
                      <div className="space-y-3">
                        {supplier.lines.map((line) => {
                          const lineError = cart.lineErrors.find((e) => e.lineId === line.id);
                          const isPriceChangeOnly = lineError?.priceChanged && lineError?.valid !== false;
                          const lineStyle = lineError
                            ? isPriceChangeOnly
                              ? "bg-amber-50 border border-amber-200"
                              : "bg-red-50 border border-red-200"
                            : "bg-slate-50";
                          return (
                            <div key={line.id} className={`rounded-lg p-3 ${lineStyle}`}>
                              <div className="flex items-center gap-4">
                                <div className="relative h-14 w-14 flex-shrink-0 rounded-lg bg-slate-100">
                                  <Package className="absolute inset-0 m-auto size-5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">
                                    {line.itemName}
                                    {line.variantName && <span className="text-slate-500"> — {line.variantName}</span>}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                    <button
                                      onClick={() => handleQuantityChange(line.id, line.quantity - 1)}
                                      className="rounded border border-slate-300 px-2 hover:bg-slate-100"
                                    >
                                      −
                                    </button>
                                    <span>{line.quantity.toLocaleString()}</span>
                                    <button
                                      onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                                      className="rounded border border-slate-300 px-2 hover:bg-slate-100"
                                    >
                                      +
                                    </button>
                                    <span>× ₱{line.unitPrice.toLocaleString()}</span>
                                  </div>
                                </div>
                                <p className="font-semibold text-slate-900">₱{line.subtotal.toLocaleString()}</p>
                                <button
                                  onClick={() => handleRemoveLine(line.id)}
                                  className="text-sm text-slate-400 hover:text-red-500"
                                >
                                  Remove
                                </button>
                              </div>
                              {lineError && (
                                <p className={`mt-2 text-sm ${isPriceChangeOnly ? "text-amber-600" : "text-red-600"}`}>{lineError.error}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex justify-end text-sm font-medium text-slate-700">
                        Supplier subtotal: ₱{supplier.subtotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

              )}



              <div className="mt-6 border-t border-slate-200 pt-4">

                <div className="flex justify-between text-lg font-bold">

                  <span>Total Amount</span>

                  <span className="text-emerald-600">₱{totalAmount.toLocaleString()}.00</span>

                </div>

                {hasInvalidLines && (
                  <p className="mt-2 text-sm text-red-600">
                    Some items in your cart need attention before you can continue.
                  </p>
                )}
                {!hasInvalidLines && hasPriceChanges && (
                  <p className="mt-2 text-sm text-amber-600">
                    Some prices in your cart were updated. Please review before continuing.
                  </p>
                )}

                <button

                  onClick={() => setStep("shipping")}

                  disabled={!cart || cart.suppliers.length === 0 || hasInvalidLines}
                  className="mt-4 w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"

                >

                  Continue to Shipping

                </button>

              </div>

            </div>

          )}



          {/* Step 2: Shipping Info */}

          {step === "shipping" && (

            <div className="rounded-xl bg-white p-6">

              <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping Information</h2>

              <div className="space-y-4">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1">

                    Contact Person

                  </label>

                  <input

                    type="text"

                    value={shippingInfo.name}

                    onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}

                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1">

                    Delivery Address

                  </label>

                  <textarea

                    value={shippingInfo.address}

                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}

                    rows={2}

                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"

                  />

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>

                    <input

                      type="text"

                      value={shippingInfo.city}

                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}

                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"

                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>

                    <input

                      type="text"

                      value={shippingInfo.province}

                      onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}

                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"

                    />

                  </div>

                </div>



                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1">

                    Contact Number

                  </label>

                  <input

                    type="tel"

                    value={shippingInfo.contact}

                    onChange={(e) => setShippingInfo({ ...shippingInfo, contact: e.target.value })}

                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1">

                    Order Notes (optional)

                  </label>

                  <textarea

                    value={shippingInfo.notes}

                    onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}

                    rows={2}

                    placeholder="Special delivery instructions..."

                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"

                  />

                </div>



                <div className="flex gap-3 pt-4">

                  <button

                    onClick={() => setStep("cart")}

                    className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"

                  >

                    Back

                  </button>

                  <button
                    onClick={() => setStep("payment")}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 cursor-pointer font-medium text-white hover:bg-emerald-700"
                  >
                    Continue to Payment

                  </button>

                </div>

              </div>

            </div>

          )}



          {/* Step 3: Payment Method */}

          {step === "payment" && (

            <div className="rounded-xl bg-white p-6">

              <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment Method</h2>

              <div className="space-y-4">

                <div className="space-y-3">

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">

                    <input

                      type="radio"

                      name="payment"

                      value="bank"

                      checked={paymentMethod === "bank"}

                      onChange={() => setPaymentMethod("bank")}

                      className="size-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"

                    />

                    <div className="flex-1">

                      <p className="font-medium text-slate-900">Bank Transfer</p>

                      <p className="text-sm text-slate-500">Direct bank payment - most common</p>

                    </div>

                    <CreditCard className="size-5 text-slate-400" />

                  </label>



                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">

                    <input

                      type="radio"

                      name="payment"

                      value="lc"

                      checked={paymentMethod === "lc"}

                      onChange={() => setPaymentMethod("lc")}

                      className="size-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"

                    />

                    <div className="flex-1">

                      <p className="font-medium text-slate-900">Letter of Credit</p>

                      <p className="text-sm text-slate-500">For large orders - secure payment</p>

                    </div>

                    <FileText className="size-5 text-slate-400" />

                  </label>



                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">

                    <input

                      type="radio"

                      name="payment"

                      value="trade-assurance"

                      checked={paymentMethod === "trade-assurance"}

                      onChange={() => setPaymentMethod("trade-assurance")}

                      className="size-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"

                    />

                    <div className="flex-1">

                      <p className="font-medium text-slate-900">Trade Assurance</p>

                      <p className="text-sm text-slate-500">Protected payment with quality guarantee</p>

                    </div>

                    <Shield className="size-5 text-emerald-500" />

                  </label>

                </div>



                <div className="flex gap-3 pt-4">

                  <button

                    onClick={() => setStep("shipping")}

                    className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"

                  >

                    Back

                  </button>

                  <button

                    onClick={() => setStep("review")}

                    className="flex-1 rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700"

                  >

                    Review Order

                  </button>

                </div>

              </div>

            </div>

          )}



          {/* Step 4: Review & Confirm */}

          {step === "review" && (

            <div className="rounded-xl bg-white p-6">

              <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Review</h2>

              <div className="space-y-6">

                <div>

                  <h3 className="font-medium text-slate-700 mb-2">Items Ordered</h3>

                  {cart?.suppliers.flatMap((s) => s.lines).map((line) => (
                    <div key={line.id} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600">
                        {line.itemName}{line.variantName ? ` — ${line.variantName}` : ""}
                      </span>
                      <span className="font-medium">₱{line.subtotal.toLocaleString()}</span>
                    </div>
                  ))}

                </div>



                <div>

                  <h3 className="font-medium text-slate-700 mb-2">Shipping To</h3>

                  <p className="text-slate-900">{shippingInfo.name}</p>

                  <p className="text-slate-600">{shippingInfo.address}</p>

                  <p className="text-slate-600">

                    {shippingInfo.city}, {shippingInfo.province}

                  </p>

                </div>



                <div>

                  <h3 className="font-medium text-slate-700 mb-2">Payment Method</h3>

                  <p className="capitalize text-slate-900">{paymentMethod.replace("-", " ")}</p>

                </div>



                <div className="border-t border-slate-200 pt-4">

                  <div className="flex justify-between text-xl font-bold">

                    <span>Total</span>

                    <span className="text-emerald-600">₱{totalAmount.toLocaleString()}.00</span>

                  </div>

                </div>



                <div className="flex gap-3 pt-4">

                  <button

                    onClick={() => setStep("payment")}

                    className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"

                  >

                    Back

                  </button>

                  <Link

                    href="/wholesale/orders"

                    className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700"

                  >

                    Confirm & Place Order

                  </Link>

                </div>

              </div>

            </div>

          )}

        </div>

      </main>
    </AgentAuthProvider>

  );

}



