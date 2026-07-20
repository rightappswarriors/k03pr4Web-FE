"use client";

import { useState } from "react";
import { X, Send, Package, Calendar, FileText } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";

type RFQModalProps = {
  product: WholesaleProduct;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: RFQFormData) => void;
};

export type RFQFormData = {
  quantity: string;
  targetPrice: string;
  requirements: string;
  deliveryDate: string;
  contactMethod: "email" | "phone" | "chat";
};

export default function RFQModal({ product, isOpen, onClose, onSubmit }: RFQModalProps) {
  const [formData, setFormData] = useState<RFQFormData>({
    quantity: "",
    targetPrice: "",
    requirements: "",
    deliveryDate: "",
    contactMethod: "email",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
      setFormData({
        quantity: "",
        targetPrice: "",
        requirements: "",
        deliveryDate: "",
        contactMethod: "email",
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Request for Quotation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Submit RFQ for <span className="font-medium">{product.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Required Quantity *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 1000 bags"
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Target Price (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₱</span>
              <input
                type="number"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                placeholder="Your target price per unit"
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Required Delivery Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                type="date"
                required
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Special Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Any specific requirements, certifications, or customization needs..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preferred Contact Method
            </label>
            <div className="flex gap-4">
              {(["email", "phone", "chat"] as const).map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={method}
                    checked={formData.contactMethod === method}
                    onChange={() => setFormData({ ...formData, contactMethod: method })}
                    className="size-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="size-4" />
              {isSubmitting ? "Submitting..." : "Submit RFQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}