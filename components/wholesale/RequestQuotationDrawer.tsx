"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Package, Calendar, FileText, Upload, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { rfqApi } from "@/services/rfq.service";
import type { WholesaleProduct, CreateRfqDto } from "@/types/wholesale";

type RequestQuotationDrawerProps = {
  product: WholesaleProduct;
  isOpen: boolean;
  onClose: () => void;
};

// Helper function for tier label - only last tier shows "+"
function tierLabel(tier: { minQty: number; maxQty?: number | null }) {
  return tier.maxQty == null ? `${tier.minQty}+` : `${tier.minQty}-${tier.maxQty}`;
}

export default function RequestQuotationDrawer({
  product,
  isOpen,
  onClose,
}: RequestQuotationDrawerProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    // Prevent body scroll when drawer is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // In a real implementation, upload to storage and get URLs
    // For now, simulate with file names as placeholders
    const newAttachments = files.map((f) => `upload://${f.name}`);
    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!quantity.trim()) {
      setError("Please specify a requested quantity.");
      return;
    }
    if (!targetPrice.trim()) {
      setError("Please specify a target unit price.");
      return;
    }

    const qty = parseInt(quantity, 10);
    const price = parseFloat(targetPrice);

    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid target unit price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createData: CreateRfqDto = {
        supplierItemId: product.id,
        quantity: qty,
        targetUnitPrice: price,
        expectedDeliveryDate: expectedDelivery || undefined,
        message: message || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const result = await rfqApi.createRfq(createData);

      // Redirect to the RFQ detail page
      router.push(`/wholesale/rfqs/${result.id}`);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create RFQ. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-[100] bg-black/50"
      />

      {/* Drawer - responsive: right sidebar on desktop, bottom sheet on mobile */}
      <div
        className={
          "fixed z-[100] flex flex-col bg-white shadow-xl transition-transform duration-300 ease-out " +
          "inset-y-0 right-0 w-full sm:max-w-lg " +
          "md:translate-x-0 " +
          "translate-x-0"
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request Quotation</h2>
            <p className="mt-1 text-sm text-slate-500">
              Send a quotation request to {product.supplier}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Error state */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Read-only Product Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase">
                Product Information
              </h3>

              {/* Supplier */}
              <div className="flex items-start gap-3">
                <Package className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">Supplier</span>
                  <p className="font-medium text-slate-900">
                    {product.supplier}
                    {product.supplierVerified && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-700">
                        ✓ Verified
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Product */}
              <div className="flex items-start gap-3">
                <Package className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">Product</span>
                  <p className="font-medium text-slate-900">{product.name}</p>
                </div>
              </div>

              {/* SKU */}
              <div className="flex items-start gap-3">
                <FileText className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">SKU</span>
                  <p className="font-medium text-slate-900">{product.sku || "—"}</p>
                </div>
              </div>

              {/* MOQ */}
              <div className="flex items-start gap-3">
                <Package className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">MOQ</span>
                  <p className="font-medium text-slate-900">{product.moq}</p>
                </div>
              </div>

              {/* Lead Time */}
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">Lead Time</span>
                  <p className="font-medium text-slate-900">{product.leadTime || "—"}</p>
                </div>
              </div>

              {/* Inventory */}
              <div className="flex items-start gap-3">
                <Package className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">Inventory</span>
                  <p className="font-medium text-slate-900">
                    {product.availableQty !== undefined
                      ? `${product.availableQty} units`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Unit */}
              <div className="flex items-start gap-3">
                <Package className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">Unit</span>
                  <p className="font-medium text-slate-900">{product.unit || "—"}</p>
                </div>
              </div>

              {/* Shipping Origin */}
              <div className="flex items-start gap-3">
                <Package className="size-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-500">Shipping Origin</span>
                  <p className="font-medium text-slate-900">{product.shippingFrom || "—"}</p>
                </div>
              </div>

              {/* Tier Pricing */}
              {product.priceTiers && product.priceTiers.length > 0 && (
                <div className="flex items-start gap-3">
                  <Package className="size-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-slate-500">Tier Pricing</span>
                    <div className="mt-1 space-y-1">
                      {product.priceTiers
                        .slice()
                        .sort((a, b) => a.minQty - b.minQty)
                        .map((tier, index) => (
                          <div
                            key={index}
                            className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
                          >
                            <span className="text-sm text-slate-600">
                              {tierLabel(tier)} pcs
                            </span>
                            <span className="font-medium text-slate-900">
                              ₱{parseFloat(tier.unitPrice).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Negotiation Fields */}
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase">
                Negotiation Details
              </h3>

              {/* Requested Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Requested Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={product.moq ? `e.g. ${product.moq} ${product.unit || "pcs"}` : "Enter quantity"}
                  min={product.moq ? parseInt(product.moq, 10) : 1}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                {product.moq && (
                  <p className="mt-1 text-xs text-slate-500">
                    Minimum order quantity: {product.moq}
                  </p>
                )}
              </div>

              {/* Target Unit Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target Unit Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
                  <input
                    type="number"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 150"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expected Delivery Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi, we're interested in purchasing your product. Can you offer ₱..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Attachments
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-4">
                      <Upload className="size-6 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-600">Upload drawings, specs, etc.</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Attachment list */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <span className="text-sm text-slate-700 truncate">
                          {file.replace("upload://", "")}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - sticky */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <Send className="size-4" />
            {isSubmitting ? "Sending..." : "Send RFQ"}
          </button>
        </div>
      </div>
    </>
  );
}
