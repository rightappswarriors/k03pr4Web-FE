import type { WholesaleSupplier } from "@/types/wholesale";

export type { WholesaleSupplier };

export const suppliers: WholesaleSupplier[] = [
  { id: "s1", name: "BuildPro Materials", specialty: "Construction supplies", location: "Cebu City", years: 8, verified: true },
  { id: "s2", name: "Golden Fields Supply", specialty: "Food staples", location: "Laguna", years: 12, verified: true },
  { id: "s3", name: "SunGrid Philippines", specialty: "Renewable energy", location: "Bulacan", years: 6, verified: true },
  { id: "s4", name: "IronCore Trading", specialty: "Steel and metals", location: "Davao City", years: 15, verified: true },
  { id: "s5", name: "PrimePipe Manufacturing", specialty: "Industrial piping", location: "Pampanga", years: 10, verified: true },
  { id: "s6", name: "PackRight Solutions", specialty: "Packaging materials", location: "Rizal", years: 7, verified: true },
];