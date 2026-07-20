import { Palette } from "lucide-react";
import type { CustomizationOption } from "@/types/wholesale";

type CustomizationCardProps = {
  customizations: CustomizationOption[];
};

export default function CustomizationCard({ customizations }: CustomizationCardProps) {
  if (!customizations || customizations.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Customization Options</h2>
      <div className="space-y-4">
        {customizations.map((option, index) => (
          <div key={index} className="border-l-4 border-emerald-600 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">{option.title}</h3>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-slate-600">
                <span className="font-medium">Minimum Quantity:</span> {option.minimumQuantity.toLocaleString()} pcs
              </p>
              {option.additionalCost && (
                <p className="text-slate-600">
                  <span className="font-medium">Additional Cost:</span> {option.additionalCost}
                </p>
              )}
              {option.description && <p className="text-slate-600">{option.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}