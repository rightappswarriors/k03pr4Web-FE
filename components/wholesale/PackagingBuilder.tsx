import { Package, Box, Weight } from "lucide-react";
import type { ProductPackaging } from "@/types/wholesale";

type PackagingBuilderProps = {
  packaging: ProductPackaging;
};

export default function PackagingBuilder({ packaging }: PackagingBuilderProps) {
  if (!packaging || Object.keys(packaging).length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Packaging & Delivery</h2>
      <div className="space-y-4">
        {packaging.sellingUnit && (
          <div className="flex items-center gap-3">
            <Package className="size-5 text-slate-400" />
            <div>
              <span className="text-sm font-medium text-slate-500">Selling Unit</span>
              <p className="text-slate-900">{packaging.sellingUnit}</p>
            </div>
          </div>
        )}

        {(packaging.packageLength || packaging.packageWidth || packaging.packageHeight) && (
          <div className="flex items-start gap-3">
            <Box className="size-5 text-slate-400 mt-0.5" />
            <div>
              <span className="text-sm font-medium text-slate-500">Package Dimensions</span>
              <p className="text-slate-900">
                {packaging.packageLength} × {packaging.packageWidth} × {packaging.packageHeight} cm
              </p>
            </div>
          </div>
        )}

        {packaging.packageWeight && (
          <div className="flex items-center gap-3">
            <Weight className="size-5 text-slate-400" />
            <div>
              <span className="text-sm font-medium text-slate-500">Package Weight</span>
              <p className="text-slate-900">{packaging.packageWeight} kg</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}