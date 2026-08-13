// Mock API layer - replace with real API endpoints when backend is ready
export { products, type WholesaleProduct } from "./products";
export { suppliers, type WholesaleSupplier } from "./suppliers";
export { categories, type WholesaleCategory } from "./categories";
export { banners, type WholesaleBanner } from "./banners";
export { type RFQSubmission, type RFQDetails } from "./rfq";

// Re-export everything from wholesale.ts for backward compatibility
export * from "./wholesale";