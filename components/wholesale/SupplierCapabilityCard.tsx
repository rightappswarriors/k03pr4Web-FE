"use client";

import { CheckCircle, XCircle, Factory, Shield, Truck, Award, Users } from "lucide-react";
import type { SupplierCapability } from "@/types/wholesale";

const capabilityIcons: Record<string, typeof Factory> = {
  Factory,
  Shield,
  Truck,
  Award,
  Users,
};

type SupplierCapabilityCardProps = {
  capabilities?: SupplierCapability[];
  className?: string;
};

export default function SupplierCapabilityCard({ capabilities, className = "" }: SupplierCapabilityCardProps) {
  if (!capabilities || capabilities.length === 0) return null;

  return (
    <div className={`rounded-xl bg-white p-6 ${className}`}>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Supplier Capabilities</h2>
      <div className="space-y-3">
        {capabilities.map((capability) => {
          const Icon = capabilityIcons[capability.icon] || Factory;
          return (
            <div key={capability.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <Icon className="size-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{capability.name}</p>
                {capability.description && (
                  <p className="text-sm text-slate-500">{capability.description}</p>
                )}
              </div>
              {capability.available ? (
                <CheckCircle className="size-5 text-emerald-600" />
              ) : (
                <XCircle className="size-5 text-slate-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}