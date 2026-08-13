// Barrel export for conversation timeline event components
export { default as ConversationEventCard } from "./ConversationEventCard";
export { default as MessageEventCard } from "./MessageEventCard";
export { default as CounterOfferCard } from "./CounterOfferCard";
export { default as OfferAcceptedCard } from "./OfferAcceptedCard";
export { default as OfferRejectedCard } from "./OfferRejectedCard";
export { default as SupplierConfirmedCard } from "./SupplierConfirmedCard";
export { default as PurchaseOrderCreatedCard } from "./PurchaseOrderCreatedCard";
export { default as ConsolidatedPoCreatedCard } from "./ConsolidatedPoCreatedCard";
export { default as PaymentReceivedCard } from "./PaymentReceivedCard";
export { default as DeliveryScheduledCard } from "./DeliveryScheduledCard";
export { default as ShipmentDispatchedCard } from "./ShipmentDispatchedCard";
export { default as RefundIssuedCard } from "./RefundIssuedCard";
export { default as SystemEventCard } from "./SystemEventCard";
export { default as FinancialSummary } from "./FinancialSummary";
export { default as SenderInfo } from "./SenderInfo";
export type { TimelineEvent } from "./ConversationEventCard";

// Event type to card mapping helper
export const EVENT_CARD_TYPES = {
  OFFER_ACCEPTED: "OfferAcceptedCard",
  OFFER_REJECTED: "OfferRejectedCard",
  SUPPLIER_CONFIRMED: "SupplierConfirmedCard",
  COUNTER_OFFER: "CounterOfferCard",
  ORDER_CREATED: "PurchaseOrderCreatedCard",
  CONSOLIDATED_PO_CREATED: "ConsolidatedPoCreatedCard",
  PAYMENT_RECEIVED: "PaymentReceivedCard",
  DELIVERY_SCHEDULED: "DeliveryScheduledCard",
  SHIPMENT_DISPATCHED: "ShipmentDispatchedCard",
  REFUND_ISSUED: "RefundIssuedCard",
  RFQ_CREATED: "SystemEventCard",
  FINAL_OFFER: "SystemEventCard",
  PRICE_ACCEPTED: "SystemEventCard",
  PRICE_REJECTED: "SystemEventCard",
  SYSTEM: "SystemEventCard",
  PAYMENT_UPDATE: "SystemEventCard",
  PAYMENT_SUBMITTED: "SystemEventCard",
  RECEIPT_UPLOADED: "SystemEventCard",
  DELIVERY_UPDATED: "SystemEventCard",
} as const;

export type EventCardType = keyof typeof EVENT_CARD_TYPES;
