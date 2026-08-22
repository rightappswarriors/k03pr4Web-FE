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
  supplierLocation?: string;
  supplierResponseTime?: string;
  supplierCapabilities?: SupplierCapability[];
  priceTiers: ProductPriceTier[];
  moq: string;
  sku?: string;
  availableQty?: number;
  sampleAvailable: boolean;
  samplePrice?: string;
  leadTime: string;
  shippingFrom: string;
  unit?: string;
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

export type PricingQuoteTier = {
  id: string;
  minQty: number;
  maxQty?: number;
  price: number;
  currency: string;
};

export type PricingQuote = {
  unitPrice: number;
  subtotal: number;
  tierApplied: PricingQuoteTier | null;
};

export type RFQFormData = {
  quantity: string;
  targetPrice: string;
  requirements: string;
  deliveryDate: string;
  contactMethod: "email" | "phone" | "chat";
};

// ============================================
// RFQ (Request for Quotation) Types
// ============================================


export type RfqSupplier = {
  id: string;
  name: string;
  verified: boolean;
  location?: string;
  rating?: number;
};

export type RfqConversationMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "AGENT" | "SUPPLIER";
  message: string;
  attachments: string[];
  createdAt: string;
};

export type RequestForQuotation = {
  id: string;
  rfqNumber: string;
  agentId: string;
  agentName: string;
  supplierOrgId?: number | null;
  supplierOrgName?: string | null;
  supplierItemId?: string | null;
  supplier?: RfqSupplier;
  status: RfqStatus;
  conversationId?: string | null;
  targetUnitPrice?: number | null;
  quantity?: number | null;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  validityDays?: number | null;
  acceptedPrice?: number | null;
  acceptedQuantity?: number | null;
  acceptedDeliveryDate?: string | null;
  messages: RfqConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export type RfqListItem = {
  id: string;
  rfqNumber: string;
  supplier: string;
  product: string;
  quantity: number;
  status: RfqStatus;
  expectedDeliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRfqDto = {
  supplierItemId: string;
  quantity: number;
  targetUnitPrice: number;
  expectedDeliveryDate?: string;
  message?: string;
  attachments?: string[];
};

export type UpdateRfqDto = {
  status?: string;
  notes?: string;
  expectedDeliveryDate?: string;
  validityDays?: number;
};

// ============================================
// Conversation & Negotiation Types
// ============================================

export type ConversationRole = "AGENT" | "SUPPLIER";

export type NegotiationOfferStatus = "PENDING" | "COUNTERED" | "ACCEPTED" | "REJECTED";

export type ConversationParticipant = {
  id: string;
  conversationId: string;
  agentId?: string | null;
  organizationId?: number | null;
  role: ConversationRole;
  joinedAt: string;
  lastReadAt?: string | null;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderOrgId?: number;
  senderRole: ConversationRole;
  message: string;
  type: string;
  attachments: string[];
  Organization?: { name: string }
  Agent?: { fullname: string, email: string}
  createdAt: string;
  clientMessageId?: string | null;
  // Event-card metadata is intentionally heterogeneous; individual cards narrow it by event type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any> | null;
};

export type NegotiationOffer = {
  id: string;
  conversationId: string;
  senderType: ConversationRole;
  senderName: string;
  quantity: number;
  unitPrice: number;
  deliveryDate?: string | null;
  notes?: string | null;
  status: NegotiationOfferStatus;
  createdAt: string;
  updatedAt: string;
  estimatedLeadTime?: string
  validUntil?: string
  Organization?: { name: string }
  Agent?: { fullname: string, email: string}
};

export type ConversationSupplier = {
  id: string;
  name: string;
  verified: boolean;
  location?: string | null;
  profilePhoto?: string | null;
  rating?: number | null;
};

export type ConversationProduct = {
  id: string;
  name: string;
  sku?: string | null;
  image?: string | null;
  unit?: string | null;
  moq?: number | null;
  availableQty?: number | null;
  leadTime?: string | null;
  priceTiers?: Array<{
    minQty: number;
    maxQty?: number | null;
    unitPrice: number;
    currency: string;
  }>;
};

export type ConversationRfq = {
  id: string;
  rfqNumber: string;
  status: string;
  targetUnitPrice?: number | null;
  quantity?: number | null;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  acceptedPrice?: number | null;
  acceptedQuantity?: number | null;
  acceptedDeliveryDate?: string | null;
  validityDays?: number | null;
  agentAcceptedAt?: string | null;
  supplierConfirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationDetail = {
  id: string;
  rfqId?: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  rfq: ConversationRfq | null;
  supplier: ConversationSupplier | null;
  product: ConversationProduct | null;
  participants: ConversationParticipant[];
  messages: ConversationMessage[];
  offers: NegotiationOffer[];
};

export type ConversationListItem = {
  id: string;
  rfqId?: string | null;
  rfqNumber?: string | null;
  supplier: ConversationSupplier | null;
  product: ConversationProduct | null;
  latestMessage: ConversationMessage | null;
  unreadCount: number;
  rfqStatus: string;
  updatedAt: string;
  createdAt: string;
};

export type SendMessageDto = {
  message: string;
  attachments?: string[];
  clientMessageId?: string;
};

export type SendOfferDto = {
  quantity: number;
  unitPrice: number;
  deliveryDate?: string;
  notes?: string;
};

export type AcceptOfferDto = {
  offerId?: string;
};

export type RejectOfferDto = {
  reason?: string;
};

export type POStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
export type POPaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
export type PurchaseOrderRfq = { id: string; rfqNumber: string; status: string; agentId?: string; acceptedPrice?: number | null; acceptedQuantity?: number | null; acceptedDeliveryDate?: string | null; notes?: string | null };
export type PurchaseOrderLineItem = { id: string; supplierItemId: string; qty: number; unitPrice: number; subtotal: number; itemName: string; itemSku: string; itemDescription: string; supplierItem: { id: string; name: string; sku?: string | null; image?: string | null; unit?: string | null } };
export type PurchaseOrderDelivery = { id?: string; scheduledDate: string; deliveredAt?: string | null; status: string; driverName?: string | null; driverContact?: string | null; latitude?: number | null; longitude?: number | null; address?: string | null; notes?: string | null };
export type PurchaseOrder = { id: string; poNumber: string; status: POStatus; paymentStatus: POPaymentStatus; totalAmount: number; vatAmount: number; createdAt: string; updatedAt: string; requestedDate?: string | null; notes?: string | null; rejectionReason?: string | null; paymentMethod?: "CARD" | "CASH" | "E_WALLET" | null; paymentReference?: string | null; paymentPreparedAt?: string | null; receiptSnapshot?: Record<string, unknown> | null; supplier: ConversationSupplier | null; rfqs: PurchaseOrderRfq[]; lineItems: PurchaseOrderLineItem[]; delivery: PurchaseOrderDelivery | null; conversation?: { id: string; messages: ConversationMessage[] } | null };



// types/wholesale.ts — add/replace this section
// Matches the Prisma enum exactly:
//
// enum RfqStatus {
//   DRAFT
//   SUBMITTED
//   UNDER_REVIEW
//   NEGOTIATING
//   SUPPLIER_OFFERED
//   BUYER_COUNTERED
//   NEGOTIATION_COMPLETED
//   NEGOTIATION_ACCEPTED
//   PO_CREATED
//   CANCELLED
//   EXPIRED
// }

export type RfqStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEGOTIATING"
  | "SUPPLIER_OFFERED"
  | "BUYER_COUNTERED"
  | "NEGOTIATION_COMPLETED"
  | "NEGOTIATION_ACCEPTED"
  | "PO_CREATED"
  | "CANCELLED"
  | "EXPIRED"
  | "RFQ_RECEIVED"
  | "PENDING_SUPPLIER_RESPONSE"
  | "COUNTER_OFFERED"
  | "AGENT_ACCEPTED_FINAL"
  | "SUPPLIER_ACCEPTED_FINAL"
  | "WAITING_SUPPLIER_CONFIRMATION"
  | "NEGOTIATION_REJECTED";
export interface RfqStatusConfig {
  label: string;
  /** pill background/text/ring classes */
  color: string;
  /** dot color class */
  dot: string;
  /** whether this status is "in motion" and should pulse */
  pulse?: boolean;
}

export const RFQ_STATUS_CONFIG: Record<RfqStatus, RfqStatusConfig> = {
  DRAFT: {
    label: "Draft",
    color: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  SUBMITTED: {
    label: "Submitted",
    color: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
    pulse: true,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    pulse: true,
  },
  NEGOTIATING: {
    label: "Negotiating",
    color: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
    pulse: true,
  },
  SUPPLIER_OFFERED: {
    label: "Supplier Offered",
    color: "bg-purple-50 text-purple-700 ring-purple-200",
    dot: "bg-purple-500",
    pulse: true,
  },
  BUYER_COUNTERED: {
    label: "You Countered",
    color: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    dot: "bg-cyan-500",
    pulse: true,
  },
  NEGOTIATION_COMPLETED: {
    label: "Negotiation Completed",
    color: "bg-teal-50 text-teal-700 ring-teal-200",
    dot: "bg-teal-500",
  },
  NEGOTIATION_ACCEPTED: {
    label: "Offer Accepted",
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  PO_CREATED: {
    label: "PO Created",
    color: "bg-green-50 text-green-700 ring-green-200",
    dot: "bg-green-600",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  NEGOTIATION_REJECTED: {
    label: "Offer Rejected",
    color: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-zinc-100 text-zinc-500 ring-zinc-200",
    dot: "bg-zinc-400",
  },
  RFQ_RECEIVED: {
    label: "RFQ Received",
    color: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
    pulse: true,
  },
  PENDING_SUPPLIER_RESPONSE: {
    label: "Awaiting Response",
    color: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    pulse: true,
  },
  COUNTER_OFFERED: {
    label: "Counter Offered",
    color: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
    pulse: true,
  },
  AGENT_ACCEPTED_FINAL: {
    label: "Agent Accepted",
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  SUPPLIER_ACCEPTED_FINAL: {
    label: "Supplier Accepted",
    color: "bg-teal-50 text-teal-700 ring-teal-200",
    dot: "bg-teal-500",
  },
  WAITING_SUPPLIER_CONFIRMATION: {
    label: "Awaiting Confirmation",
    color: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
    pulse: true,
  },
};

export type NegotiationStatus =
  | "PENDING"
  | "AGENT_ACCEPTED"
  | "WAITING_SUPPLIER_CONFIRMATION"
  | "SUPPLIER_CONFIRMED"
  | "PO_CREATED"
  | "REJECTED";
