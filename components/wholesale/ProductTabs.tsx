"use client";

import { useState } from "react";
import { Image as ImageIcon, FileText, HelpCircle, Download, MessageCircle } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";
import AttributeTable from "./AttributeTable";
import ProductReviews from "./ProductReviews";
import ProductDocuments from "./ProductDocuments";
import SupplierCapabilityCard from "./SupplierCapabilityCard";

type Tab = "overview" | "specifications" | "reviews" | "documents" | "faqs";

type ProductTabsProps = {
  product: WholesaleProduct;
};

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; icon: typeof ImageIcon }[] = [
    { id: "overview", label: "Overview", icon: ImageIcon },
    { id: "specifications", label: "Specifications", icon: FileText },
    { id: "reviews", label: `Reviews (${product.reviews?.length || 0})`, icon: MessageCircle },
    { id: "documents", label: "Documents", icon: Download },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
  ];

  return (
    <div className="rounded-xl bg-white">
      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const hasContent =
            (tab.id === "reviews" && product.reviews && product.reviews.length > 0) ||
            (tab.id === "documents" && product.documents && product.documents.length > 0) ||
            tab.id === "overview" ||
            tab.id === "specifications" ||
            tab.id === "faqs";

          if (tab.id === "reviews" && !product.reviews?.length) return null;
          if (tab.id === "documents" && !product.documents?.length) return null;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Product Overview
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {product.moq ? `${product.name} - Wholesale product with MOQ: ${product.moq}. ` : `${product.name} - `}
              High quality wholesale product from verified Philippine suppliers. Perfect for bulk purchasing with competitive pricing tiers.
              Lead time: {product.leadTime}. Ships from {product.shippingFrom}.
            </p>

            {/* Supplier Capabilities */}
            {product.supplierCapabilities && (
              <div className="mt-8">
                <h4 className="text-md font-semibold text-slate-900 mb-3">Supplier Capabilities</h4>
                <SupplierCapabilityCard capabilities={product.supplierCapabilities} />
              </div>
            )}
          </div>
        )}

        {activeTab === "specifications" && product.attributes && (
          <AttributeTable attributes={product.attributes} />
        )}

        {activeTab === "reviews" && product.reviews && (
          <ProductReviews
            reviews={product.reviews}
            averageRating={product.rating}
            totalReviews={product.totalOrders}
          />
        )}

        {activeTab === "documents" && product.documents && (
          <ProductDocuments documents={product.documents} />
        )}

        {activeTab === "faqs" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900">What is the MOQ for this product?</h4>
                <p className="mt-2 text-sm text-slate-600">The minimum order quantity is {product.moq}. For smaller quantities, please contact the supplier directly.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900">What is the lead time for delivery?</h4>
                <p className="mt-2 text-sm text-slate-600">Lead time is {product.leadTime}. Shipping times may vary based on destination and quantity ordered.</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900">Do you offer customization services?</h4>
                <p className="mt-2 text-sm text-slate-600">
                  {product.customizations && product.customizations.length > 0
                    ? `${product.customizations.length} customization option${product.customizations.length > 1 ? "s" : ""} available. Contact supplier for details.`
                    : "Customization available for qualified orders. Contact the supplier for MOQ requirements."}
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900">What payment methods are accepted?</h4>
                <p className="mt-2 text-sm text-slate-600">Common payment methods include bank transfer, LC at sight, and trade assurance for verified suppliers.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}