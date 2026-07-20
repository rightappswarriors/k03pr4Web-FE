"use client";

import { X, Shield, Lock, Package, RefreshCw, HelpCircle, Database } from "lucide-react";

type OrderProtectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function OrderProtectionModal({ isOpen, onClose }: OrderProtectionModalProps) {
  if (!isOpen) return null;

  const sections = [
    {
      icon: Shield,
      title: "How Your Order Is Protected",
      content: "You place orders directly through our platform with verified suppliers. Each order is tracked from creation to delivery, ensuring you receive exactly what you ordered at the agreed price.",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      content: "We support multiple secure payment methods including GCash, PayMaya, credit cards via PayMongo, and bank transfers. All transactions are encrypted and processed through secure channels.",
    },
    {
      icon: Package,
      title: "Guaranteed Delivery",
      content: "Suppliers commit to delivery timelines based on their lead times. Our platform tracks orders and provides visibility into shipment status. Communication issues with suppliers are mediated through our support team.",
    },
    {
      icon: RefreshCw,
      title: "Money-Back Guarantee",
      content: "If your order doesn't arrive or the items don't match what was agreed, our support team will help resolve the issue. After purchase confirmation, payments are held until delivery verification.",
      note: "// TODO: Confirm actual policy percentage and timeframe",
    },
    {
      icon: HelpCircle,
      title: "Customer Support",
      content: "Our support team is available to assist with order inquiries, supplier issues, and returns. Contact us through the messaging system or support channels if you need help with your purchase.",
    },
    {
      icon: Database,
      title: "Data Privacy",
      content: "Your personal and order information is protected according to our privacy policy. We only share necessary details with suppliers to fulfill your orders, and never sell your data to third parties.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative rounded-xl bg-white p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="size-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Order Protection</h2>
          </div>
          <p className="text-slate-600">
            Your wholesale purchases are protected by our platform guarantees.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <section.icon className="size-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{section.title}</h3>
                <p className="text-sm text-slate-600">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}