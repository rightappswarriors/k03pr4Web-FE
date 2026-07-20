"use client";

import { useState } from "react";
import { Palette, ChevronDown, Check } from "lucide-react";
import type { CustomizationOption } from "@/types/wholesale";

type CustomizationBuilderProps = {
  customizations: CustomizationOption[];
  onCustomizationChange?: (customizations: CustomizationOption[]) => void;
};

const customizationTypeLabels: Record<string, string> = {
  OEM: "OEM Branding",
  ODM: "ODM Custom Product",
  PRINTING: "Custom Printing",
  PACKAGING: "Packaging Options",
  OTHER: "Other Customization",
};

const customizationTypeColors: Record<string, string> = {
  OEM: "from-blue-500 to-indigo-600",
  ODM: "from-purple-500 to-pink-600",
  PRINTING: "from-emerald-500 to-teal-600",
  PACKAGING: "from-amber-500 to-orange-600",
  OTHER: "from-slate-500 to-gray-600",
};

export default function CustomizationBuilder({ customizations, onCustomizationChange }: CustomizationBuilderProps) {
  const safeCustomizations = customizations ?? [];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  if (safeCustomizations.length === 0) return null;

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleOptionSelect = (customizationId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [customizationId]: value }));

    const updatedCustomizations = safeCustomizations.map((opt) => {
      if (opt.id === customizationId) {
        const selected = opt.options?.find((o) => o.value === value);
        return { ...opt, selectedOption: selected };
      }
      return opt;
    });

    onCustomizationChange?.(updatedCustomizations);
  };

  return (
    <div className="rounded-xl bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="size-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-slate-900">Customization Options</h2>
      </div>

      <div className="space-y-4">
        {safeCustomizations.map((option, index) => {
          const customizationId = option.id || `custom-${index}`;
          const isExpanded = expandedSections[option.title] ?? false;
          const selectedValue = selectedOptions[customizationId];

          return (
            <div key={customizationId} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(option.title)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded bg-gradient-to-r ${customizationTypeColors[option.type]} text-white`}
                    >
                      {customizationTypeLabels[option.type]}
                    </span>
                    <h3 className="font-medium text-slate-900">{option.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    MOQ: {option.minimumQuantity.toLocaleString()} pcs
                    {option.additionalCost && ` • Additional Cost: ${option.additionalCost}`}
                  </p>
                </div>
                <ChevronDown
                  className={`size-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-slate-200">
                  {option.description && (
                    <p className="text-sm text-slate-600 mb-4">{option.description}</p>
                  )}

                  {option.options && option.options.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Select an option:</p>
                      <div className="grid gap-2">
                        {option.options.map((choice) => (
                          <button
                            key={choice.value}
                            onClick={() => handleOptionSelect(customizationId, choice.value)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              selectedValue === choice.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`font-medium ${
                                  selectedValue === choice.value ? "text-emerald-700" : "text-slate-900"
                                }`}>
                                  {choice.label}
                                </p>
                                {choice.description && (
                                  <p className="text-sm text-slate-500">{choice.description}</p>
                                )}
                              </div>
                              {selectedValue === choice.value && (
                                <Check className="size-5 text-emerald-600" />
                              )}
                            </div>
                            {choice.price && (
                              <p className={`text-sm mt-1 ${
                                selectedValue === choice.value ? "text-emerald-600" : "text-slate-600"
                              }`}>
                                {choice.price}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-600">
                        Contact supplier for customization details
                      </p>
                      <button className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        Request customization quote
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}