"use client";



import { useState, useEffect } from "react";

import { CreditCard, Truck, FileText, Shield, Package } from "lucide-react";

import Header from "@/components/layout/Header";
import AgentAuthProvider from "@/components/auth/AgentAuthProvider";

import Link from "next/link";

import { wholesaleApi } from "@/services/wholesale.service";



type CartItem = {

  supplierItemId: string;

  variantId: string | null;

  quantity: number;

  unitPrice: number;

  subtotal: number;

  addedAt: string;

};



export default function WholesaleCheckoutPage() {

  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "review">("cart");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [cartLoading, setCartLoading] = useState(true);

  const [cartDetails, setCartDetails] = useState<Record<string, { name: string; image?: string }>>({});



  // Load cart from server or localStorage on mount

  useEffect(() => {

    const loadCart = async () => {

      setCartLoading(true);

      try {

        // Check if authenticated

        const token = localStorage.getItem("access_token");

        if (token) {

          // Authenticated: try to load from server (placeholder - would need endpoint)

          // For now, fall through to localStorage check

        }



        // Load from localStorage (works for both guest and fallback)

        const stored = localStorage.getItem("wholesale_cart");

        if (stored) {

          const items = JSON.parse(stored);

          setCartItems(items);

        }

      } catch (e) {

        console.error("Failed to load cart:", e);

      } finally {

        setCartLoading(false);

      }

    };

    loadCart();

  }, []);



  // Load product details for cart items

  useEffect(() => {

    const loadDetails = async () => {

      const details: Record<string, { name: string; image?: string }> = {};

      for (const item of cartItems) {

        try {

          if (!details[item.supplierItemId]) {

            const product = await wholesaleApi.getProduct(item.supplierItemId);

            details[item.supplierItemId] = {

              name: product.name,

              image: product.image,

            };

          }

        } catch {}

      }

      setCartDetails(details);

    };

    if (cartItems.length > 0) {

      loadDetails();

    }

  }, [cartItems]);



  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

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

                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${

                    step === s || (i < ["cart", "shipping", "payment", "review"].indexOf(step))

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

            ) : cartItems.length === 0 ? (

              <div className="text-center py-8">

                <p className="text-slate-600">Your cart is empty.</p>

                <Link href="/wholesale/products" className="mt-4 inline-block text-emerald-600 hover:underline">

                  Continue shopping

                </Link>

              </div>

            ) : (

              <div className="space-y-4">

                {cartItems.map((item) => {

                  const details = cartDetails[item.supplierItemId];

                  return (

                    <div key={item.supplierItemId + (item.variantId || "")} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0">

                      <div className="relative h-16 w-16 rounded-lg bg-slate-100">

                        {details?.image && (

                          <img

                            src={details.image}

                            alt={details.name}

                            className="h-full w-full rounded-lg object-cover"

                          />

                        )}

                        <Package className="absolute inset-0 m-auto size-6 text-slate-400" />

                      </div>

                      <div className="flex-1">

                        <p className="font-medium text-slate-900">{details?.name || item.supplierItemId}</p>

                        <p className="text-sm text-slate-600">

                          Qty: {item.quantity.toLocaleString()} | ₱{item.unitPrice.toLocaleString()} each

                        </p>

                      </div>

                      <p className="font-semibold text-slate-900">₱{item.subtotal.toLocaleString()}</p>

                    </div>

                  );

                })}

              </div>

            )}



            <div className="mt-6 border-t border-slate-200 pt-4">

              <div className="flex justify-between text-lg font-bold">

                <span>Total Amount</span>

                <span className="text-emerald-600">₱{totalAmount.toLocaleString()}.00</span>

              </div>

              <button

                onClick={() => setStep("shipping")}

                className="mt-4 w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700"

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

                {cartItems.map((item) => {

                  const details = cartDetails[item.supplierItemId];

                  return (

                    <div key={item.supplierItemId + (item.variantId || "")} className="flex justify-between py-2 border-b border-slate-100 last:border-0">

                      <span className="text-slate-600">{details?.name || item.supplierItemId}</span>

                      <span className="font-medium">₱{item.subtotal.toLocaleString()}</span>

                    </div>

                  );

                })}

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



