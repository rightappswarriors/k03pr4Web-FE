"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DeliveryAddressForm from "@/components/ui/DeliveryAddressForm";
import PickupBranchSelector from "@/components/ui/PickupBranchSelector";
import CheckoutSummary from "@/sections/checkout/CheckoutSummary";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Store, X, MapPin, Bike } from "lucide-react";
import { useCart } from "@/store/useCart";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import type { ApiOutlet } from "@/types/api-outlet";
import { Checkbox } from "@/components/ui/Checkbox";


type AddressItem = {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  street_address: string;
  postal_code: string;
  lat: number;
  lng: number;
  is_default: boolean;
};

type CheckoutCartItem = {
  id: number;
  product_id: number;
  branch_id: number | null;
  product_name: string;
  image: string | null;
  outlet_name: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

type CartResponse = {
  id: number;
  items: CheckoutCartItem[];
  total_quantity: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

type CheckoutResponse = {
  id: number;
  transactionnumber: string;
  subtotal: number;
  total: number;
  status: string;
  paymentmethod: string;
  paymentstatus: string;
  customernote: string;
  createdat: string;
  items: unknown[];
  tracking: unknown[];
};

export default function CheckoutPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"delivery" | "pickup" | null>(null);
  const [selectedStore, setSelectedStore] = useState<ApiOutlet | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online" | null>(null);
  const [onlinePaymentOption, setOnlinePaymentOption] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const clearCart = useCart((state) => state.clearCart);
  const setCount = useCart((state) => state.setCount);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const items = cart?.items || [];

  const summaryItems = items.map((item) => ({
    id: item.id,
    name: item.product_name,
    image: item.image,
    price: Number(item.unit_price),
    cartQuantity: item.quantity,
  }));


  const [couriers, setCouriers] = useState<any[]>([]);
  const [selectedCourierIds, setSelectedCourierIds] = useState<number[]>([]);

  const [isAnySelected, setIsAnySelected] = useState(false);


  const handleCourierToggle = (
    courierId: number,
    courierName: string
  ) => {

    // IF USER CLICKED "ANY"
    if (courierName.toLowerCase() === "any") {

      // clear all selected couriers
      setSelectedCourierIds([]);

      // toggle Any checkbox
      setIsAnySelected((prev) => !prev);

      return;
    }

    // if selecting normal courier,
    // automatically uncheck "Any"
    setIsAnySelected(false);

    setSelectedCourierIds((prev) => {

      // uncheck selected courier
      if (prev.includes(courierId)) {
        return prev.filter((id) => id !== courierId);
      }

      // max 3 couriers only
      if (prev.length >= 3) return prev;

      return [...prev, courierId];
    });
  };

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        localStorage.setItem("redirect_after_login", "/checkout");
        router.push("/login");
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
          clearCart();
          setCount(0);
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch cart: ${res.status} - ${text}`);
        }

        const data: CartResponse = await res.json();
        setCart(data);
        setCount(data.total_quantity || 0);
      } catch (error) {
        console.error("Error fetching checkout cart:", error);
        setCart(null);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCart();
  }, [API_URL, clearCart, router, setCount]);


  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const res = await fetch(`${API_URL}/couriers/`);
        const data = await res.json();
        setCouriers(data);
      } catch (error) {
        console.error("Failed to fetch couriers:", error);
      }
    };

    fetchCouriers();
  }, [API_URL]);


  const canPlaceOrder =
    items.length > 0 &&
    !placingOrder &&
    (mode === "delivery"
      ? !!selectedAddress &&
        !!paymentMethod &&
        (selectedCourierIds.length > 0 || isAnySelected) &&
        (paymentMethod === "cod" || !!onlinePaymentOption)
      : mode === "pickup"
      ? !!selectedStore
      : false);

  const getErrorMessage = (data: any) => {
    if (!data) return "Failed to place order.";
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    if (typeof data === "string") return data;
    return "Failed to place order.";
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !mode) return;

    const token = localStorage.getItem("access");

    if (!token) {
      localStorage.setItem("redirect_after_login", "/checkout");
      router.push("/login");
      return;
    }

    const outletId =
      mode === "pickup"
        ? selectedStore?.id ?? null
        : items.length > 0
        ? items[0].branch_id
        : null;

    if (!outletId) {
      alert("Please select a valid store or branch before placing the order.");
      return;
    }

    const payload = {
      outlet_id: outletId,
      delivery_address_id: mode === "delivery" ? (selectedAddress?.id ?? null) : null,
      order_type: mode === "delivery" ? "DELIVERY" : "PICKUP",
      payment_method:
        mode === "pickup"
          ? "PAY_AT_STORE"
          : paymentMethod === "cod"
          ? "COD"
          : onlinePaymentOption || "ONLINE",
      customer_note: "",
      courier_ids:
        mode === "delivery"
          ? isAnySelected
            ? []
            : selectedCourierIds
          : [],
    };

    try {
      setPlacingOrder(true);

      const res = await fetch(`${API_URL}/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // --- CRITICAL CHANGE STARTS HERE ---
      const responseText = await res.text();
      let data: any = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error("Invalid response from server.");
      }

      if (res.status === 401) {
        localStorage.removeItem("access");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const errorMessage = getErrorMessage(data);
        alert(errorMessage);

        // If stock was insufficient, refetch the cart so the UI updates
        if (res.status === 400) {
          // We can't call fetchCart directly because it's inside useEffect
          // But we can trigger a window reload or a state update
          window.location.reload(); 
        }
        return;
      }
      // --- CRITICAL CHANGE ENDS HERE ---

      clearCart();
      setCount(0);
      setCart(null);
      localStorage.removeItem("latest_checkout_order");

      router.push(`/tracking/${data.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCart) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
        <Header />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-lg text-slate-500">Loading checkout...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f7f7f5]">
      <Header />

      <section className="flex-1 container-shell py-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-brand-blue md:text-[32px]">
          Checkout
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div className="space-y-5">
              <h3 className="text-lg font-serif font-bold text-brand-blue">
                How would you like to receive your order?
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={() => {
                    setMode("delivery");
                    setSelectedStore(null);
                  }}
                  className={`flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition-all ${
                    mode === "delivery"
                      ? "border-[#3a9688] bg-[#f8faf9]"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <Truck
                    className={`h-6 w-6 ${
                      mode === "delivery" ? "text-[#3a9688]" : "text-slate-400"
                    }`}
                  />
                  <span className="text-base font-bold text-brand-blue">Delivery</span>
                  <span className="text-xs font-medium text-slate-400">
                    Delivered to your address
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMode("pickup");
                    setSelectedAddress(null);
                    setPaymentMethod(null);
                    setOnlinePaymentOption(null);
                    setDeliveryFee(0);
                  }}
                  className={`flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition-all ${
                    mode === "pickup"
                      ? "border-[#3a9688] bg-[#f8faf9]"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <Store
                    className={`h-6 w-6 ${
                      mode === "pickup" ? "text-[#3a9688]" : "text-slate-400"
                    }`}
                  />
                  <span className="text-base font-bold text-brand-blue">Pickup</span>
                  <span className="text-xs font-medium text-slate-400">
                    Pick up at a store near you
                  </span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === "delivery" && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="border-t border-slate-100 pt-6">
                    <div className="rounded-xl border border-slate-100 bg-white p-1">
                      <DeliveryAddressForm
                        selectedAddress={selectedAddress}
                        onSelectAddress={setSelectedAddress}
                        onDeliveryFeeChange={setDeliveryFee}
                      />
                    </div>
                  </div>

                  <PaymentMethod
                    selectedMethod={paymentMethod}
                    selectedOption={onlinePaymentOption}
                    onMethodChange={setPaymentMethod}
                    onOptionChange={setOnlinePaymentOption}
                  />
                </motion.div>
              )}


              {mode === "delivery" && selectedAddress && paymentMethod === "cod" && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  
                  {/* HEADER */}
                  <div className="flex items-center gap-2 mb-2">
                    <Bike className="h-5 w-5 text-[#3a9688]" />
                    <h3 className="text-lg font-serif font-bold text-brand-blue">
                      Preferred Rider
                    </h3>
                  </div>

                  <p className="text-sm text-slate-500 mb-4">
                    Select up to 3 preferred couriers for your delivery.
                  </p>

                  {/* GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {couriers.map((courier) => {
                      const isChecked =
                        courier.name.toLowerCase() === "any"
                          ? isAnySelected
                          : selectedCourierIds.includes(courier.id);

                      return (
                        <label
                          key={courier.id}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? "border-[#3a9688] bg-[#f8faf9]"
                              : "border-slate-200 hover:border-[#3a9688]/50"
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() =>
                              handleCourierToggle(courier.id, courier.name)
                            }
                          />
                          <span className="text-sm font-medium text-brand-blue">
                            {courier.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* SELECTED TEXT */}
                  {(selectedCourierIds.length > 0 || isAnySelected) && (
                    <p className="text-xs text-slate-500 mt-3">
                      {isAnySelected
                        ? "Selected: Any"
                        : `Selected: ${couriers
                            .filter(c => selectedCourierIds.includes(c.id))
                            .map(c => c.name)
                            .join(", ")}`}
                    </p>
                  )}
                </div>
              )}


              {mode === "pickup" && (
                <motion.div
                  key="pickup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="border-t border-slate-100 pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      {selectedStore && (
                        <button
                          onClick={() => setSelectedStore(null)}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#3a9688] hover:underline"
                        >
                          <X className="h-3 w-3" /> Change Branch
                        </button>
                      )}
                    </div>

                    {selectedStore && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 flex items-center gap-3 rounded-xl border-2 border-[#3a9688] bg-[#f8faf9] p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3a9688] text-white shadow-sm">
                          <Store className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-bold leading-tight text-brand-blue">
                            {selectedStore.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {selectedStore.address || selectedStore.branch_address}
                          </p>
                        </div>
                        <MapPin className="h-4 w-4 text-[#3a9688] opacity-40" />
                      </motion.div>
                    )}

                    <PickupBranchSelector
                      onSelect={(store) => setSelectedStore(store)}
                      selectedStore={selectedStore}
                      cartItems={items}
                    />
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-center text-xs font-medium text-slate-500">
                      Payment for pickup orders will be settled at the store branch.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <div className="sticky top-24 space-y-4">
              <CheckoutSummary
                items={summaryItems}
                deliveryFee={mode === "delivery" ? deliveryFee : 0}
                mode={mode}
              />

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder}
                className={`flex w-full items-center justify-center rounded-xl py-3 text-base font-bold text-white transition-all ${
                  canPlaceOrder
                    ? "bg-[#1f5f56] shadow-lg shadow-[#3a9688]/20 hover:bg-[#148a78]"
                    : "pointer-events-none cursor-not-allowed bg-slate-300"
                }`}
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}