import type { WholesaleCategory } from "@/types/wholesale";

export type { WholesaleCategory };

export const categories: WholesaleCategory[] = [
  { id: "construction-building", name: "Construction & Building", icon: "Hammer" },
  { id: "electronics", name: "Electronics", icon: "Cpu" },
  { id: "food-beverages", name: "Food & Beverages", icon: "Utensils" },
  { id: "agriculture", name: "Agriculture", icon: "Wheat" },
  { id: "automotive", name: "Automotive", icon: "Car" },
  { id: "health-medical", name: "Health & Medical", icon: "HeartPulse" },
  { id: "packaging-printing", name: "Packaging & Printing", icon: "Package" },
  { id: "home-living", name: "Home & Living", icon: "House" },
  { id: "industrial-equipment", name: "Industrial Equipment", icon: "Factory" },
];