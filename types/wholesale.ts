export type WholesaleCategory = { id: string; name: string; icon: string };

export type ProductPriceTier = {
  minQty: number;
  maxQty?: number;
  unitPrice: string;
  currency: string;
};

export type ProductAttribute = {
  name: string;
  value: string;
  unit?: string;
  groupName?: string;
  category?: string;
};

export type CustomizationOption = {
  id?: string;
  title: string;
  type: "OEM" | "ODM" | "PRINTING" | "PACKAGING" | "OTHER";
  minimumQuantity: number;
  additionalCost?: string;
  description?: string;
  options?: CustomizationChoice[];
  selectedOption?: CustomizationChoice;
};

export type CustomizationChoice = {
  label: string;
  value: string;
  price?: string;
  description?: string;
};

export type ProductDocument = {
  id: string;
  type: "CE" | "FDA" | "ISO" | "MSDS" | "RoHS" | "OTHER";
  title: string;
  fileUrl: string;
  verified?: boolean;
};

export type ProductPackaging = {
  sellingUnit?: string;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  packageWeight?: number;
};

export type ProductShipping = {
  originCountry?: string;
  originProvince?: string;
  originCity?: string;
  estimatedDays?: number;
  shippingNotes?: string;
};

export type ProductReview = {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
};

// Variant type for color/variant selection
export type ProductVariant = {
  id: string;
  name: string;
  sku?: string;
  price: number;
  availableQty: number;
  image?: string;
  isDefault: boolean;
  options: Array<{
    group: string;
    value: string;
    colorHex?: string;
  }>;
  images?: string[];
};

// Full product detail type for the detail page
export type WholesaleProductDetail = {
  id: string;
  name: string;
  supplierItemImage?: string[]; // Primary images array
  images?: string[]; // Alias for backward compatibility
  description?: string;
  supplier: string;
  supplierVerified: boolean;
  supplierLocation: string;
  supplierResponseTime?: string;
  supplierCapabilities?: SupplierCapability[];
  priceTiers: ProductPriceTier[];
  moq: string;
  sampleAvailable: boolean;
  samplePrice?: string;
  leadTime: string;
  shippingFrom: string;
  category: string;
  verified: boolean;
  totalOrders?: number;
  rating?: number;
  attributes?: ProductAttribute[];
  customizations?: CustomizationOption[];
  packaging?: ProductPackaging;
  shippingInfo?: ProductShipping;
  documents?: ProductDocument[];
  reviews?: ProductReview[];
  variants?: ProductVariant[];
};

// Simplified product type for listings
export type WholesaleProduct = WholesaleProductDetail & {
  image?: string; // Alias for images[0] for listing compatibility
  price?: string; // Alias for priceTiers[0]?.unitPrice for listing
  unit?: string;
  location?: string;
};

export type WholesaleBanner = { id: string; eyebrow: string; title: string; copy: string; image: string };
export type SupplierCapability = {
  id: string;
  name: string;
  icon: string;
  available: boolean;
  description?: string;
};

export type WholesaleSupplier = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  years: number;
  verified: boolean;
  rating?: number;
  totalReviews?: number;
  responseRate?: number;
  responseTime?: string;
  capabilities?: SupplierCapability[];
};

export type QuoteStatus = "pending" | "quoted" | "accepted" | "rejected" | "expired";

export type QuoteItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  total: string;
  currency: string;
};

export type WholesaleQuote = {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  supplierVerified: boolean;
  status: QuoteStatus;
  quantity: string;
  targetPrice?: string;
  quotedPrice?: string;
  currency: string;
  submittedDate: string;
  expiryDate?: string;
  items?: QuoteItem[];
  notes?: string;
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type WholesaleOrder = {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  currency: string;
  status: OrderStatus;
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: string;
  paymentMethod: string;
};

export type WholesaleCartItem = {
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  total: string;
  currency: string;
  image?: string;
};

export type RFQFormData = {
  quantity: string;
  targetPrice: string;
  requirements: string;
  deliveryDate: string;
  contactMethod: "email" | "phone" | "chat";
};
