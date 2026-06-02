"use client";

import { Wallet, CreditCard } from "lucide-react";

type PaymentMethodProps = {
  selectedMethod: "cod" | "online" | null;
  selectedOption: string | null;
  onMethodChange: (method: "cod" | "online" | null) => void;
  onOptionChange: (option: string | null) => void;
};

export default function PaymentMethod({
  selectedMethod,
  selectedOption,
  onMethodChange,
  onOptionChange,
}: PaymentMethodProps) {
  const onlineOptions = [
    {
      id: "gcash",
      name: "GCash",
      desc: "Pay via GCash e-wallet",
      icon: "📱",
    },
    {
      id: "maya",
      name: "Maya",
      desc: "Pay via Maya e-wallet",
      icon: "💳",
    },
    {
      id: "card",
      name: "Credit / Debit Card",
      desc: "Visa, Mastercard, etc.",
      icon: "💳",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      desc: "Direct bank payment",
      icon: "🏦",
    },
  ];

  return (
    <div className="space-y-5 border-t border-slate-100 pt-6">
      <h3 className="text-lg font-serif font-bold text-brand-blue">
        Payment Method
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          onClick={() => {
            onMethodChange("cod");
            onOptionChange(null);
          }}
          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
            selectedMethod === "cod"
              ? "border-[#3a9688] bg-[#f8faf9]"
              : "border-slate-200 hover:border-[#de922f] hover:bg-[#fff7ed]"
          }`}
        >
          <Wallet className="mt-1 h-5 w-5 text-[#3a9688]" />
          <div>
            <p className="text-sm font-bold text-brand-blue">
              Cash on Delivery
            </p>
            <p className="text-xs text-slate-500">Pay when you receive</p>
          </div>
        </button>

        <button
          onClick={() => onMethodChange("online")}
          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
            selectedMethod === "online"
              ? "border-[#3a9688] bg-[#f8faf9]"
              : "border-slate-200 hover:border-[#de922f] hover:bg-[#fff7ed]"
          }`}
        >
          <CreditCard className="mt-1 h-5 w-5 text-[#3a9688]" />
          <div>
            <p className="text-sm font-bold text-brand-blue">
              Online Payment
            </p>
            <p className="text-xs text-slate-500">
              E-wallet, card, or bank
            </p>
          </div>
        </button>
      </div>

      {selectedMethod === "online" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Select payment option:</p>

          {onlineOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => onOptionChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                selectedOption === item.id
                  ? "border-[#3a9688] bg-[#f8faf9]"
                  : "border-slate-200 hover:border-[#de922f] hover:bg-[#fff7ed]"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full border ${
                  selectedOption === item.id
                    ? "border-[#3a9688] bg-[#3a9688]"
                    : "border-slate-400"
                }`}
              />

              <span className="text-lg">{item.icon}</span>

              <div>
                <p className="text-sm font-semibold text-brand-blue">
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}