"use client";

import type { ConversationMessage, NegotiationOffer } from "@/types/wholesale";
import MessageEventCard from "./MessageEventCard";
import CounterOfferCard from "./CounterOfferCard";
import OfferAcceptedCard from "./OfferAcceptedCard";
import OfferRejectedCard from "./OfferRejectedCard";
import SupplierConfirmedCard from "./SupplierConfirmedCard";
import PurchaseOrderCreatedCard from "./PurchaseOrderCreatedCard";
import ConsolidatedPoCreatedCard from "./ConsolidatedPoCreatedCard";
import PaymentReceivedCard from "./PaymentReceivedCard";
import DeliveryScheduledCard from "./DeliveryScheduledCard";
import ShipmentDispatchedCard from "./ShipmentDispatchedCard";
import RefundIssuedCard from "./RefundIssuedCard";
import SystemEventCard from "./SystemEventCard";

// A unified timeline event — either a message (which may be a system event)
// or a raw offer record.
export type TimelineEvent =
  | { kind: "message"; data: ConversationMessage }
  | { kind: "offer"; data: NegotiationOffer };

export interface ConversationEventCardProps {
  event: TimelineEvent;
  isLatestOffer?: boolean;
  supplierName?: string;
  buyerName?: string;
  onAcceptOffer?: (offerId: string) => void;
  onCounterOffer?: (offer: NegotiationOffer) => void;
  onRejectOffer?: (offerId: string) => void;
  onViewPO?: (poId: string) => void;
  onViewTracking?: (url: string) => void;
  onViewReceipt?: (url: string) => void;
}

// Builds a NegotiationOffer-shaped object out of a COUNTER_OFFER / FINAL_OFFER
// ConversationMessage's `metadata` so it can render through the same
// CounterOfferCard used for raw offer records. Both message types carry the
// identical payload shape (see rfqNegotiation.service.ts sendCounterOffer /
// sendFinalOffer), so this is shared rather than duplicated per case.
function offerFromMessage(message: ConversationMessage): NegotiationOffer {
  const meta = message.metadata ?? {};
  return {
    id: message.rfqOfferId ?? message.id,
    conversationId: message.conversationId,
    senderType: message.senderRole,
    senderName: message.senderName,
    quantity: meta.quantity ?? 0,
    unitPrice: meta.unitPrice ?? 0,
    deliveryDate: meta.deliveryDate ?? null,
    notes: meta.notes ?? null,
    status: "PENDING" as const,
    negotiationStatus: null,
    minimumOrderQuantity: meta.minimumOrderQuantity ?? null,
    estimatedLeadTime: meta.estimatedLeadTime ?? null,
    validUntil: meta.validUntil ?? null,
    createdAt: message.createdAt,
    updatedAt: message.createdAt,
  } as NegotiationOffer;
}

/**
 * Dispatches to the correct card component based on the message type or
 * whether the event is an offer record.
 *
 * Structured timeline cards (full-width, centered):
 *  - OFFER_ACCEPTED → OfferAcceptedCard
 *  - OFFER_REJECTED → OfferRejectedCard
 *  - SUPPLIER_CONFIRMED → SupplierConfirmedCard
 *  - COUNTER_OFFER / FINAL_OFFER (as message) → CounterOfferCard
 *  - ORDER_CREATED → PurchaseOrderCreatedCard
 *  - CONSOLIDATED_PO_CREATED → ConsolidatedPoCreatedCard
 *  - PAYMENT_RECEIVED → PaymentReceivedCard
 *  - DELIVERY_SCHEDULED → DeliveryScheduledCard
 *  - SHIPMENT_DISPATCHED → ShipmentDispatchedCard
 *  - REFUND_ISSUED → RefundIssuedCard
 *
 * Everything else falls through to SystemEventCard.
 */
export default function ConversationEventCard({
  event,
  isLatestOffer = false,
  supplierName = "Supplier",
  buyerName = "You",
  onAcceptOffer,
  onCounterOffer,
  onRejectOffer,
  onViewPO,
  onViewTracking,
  onViewReceipt,
}: ConversationEventCardProps) {
  if (event.kind === "offer") {
    const offer = event.data;
    return (
      <CounterOfferCard
        offer={offer}
        isLatest={isLatestOffer}
        isFromSupplier={offer.senderType === "SUPPLIER"}
        supplierName={supplierName}
        buyerName={buyerName}
        onAccept={onAcceptOffer}
        onCounter={onCounterOffer}
        onReject={onRejectOffer}
      />
    );
  }

  const message = event.data;
  const msgType = message.type;

  switch (msgType) {
    case "OFFER_ACCEPTED":
      return <OfferAcceptedCard message={message} buyerName={buyerName} />;

    case "OFFER_REJECTED":
      return <OfferRejectedCard message={message} senderRole={message.senderRole} />;

    case "SUPPLIER_CONFIRMED":
      return <SupplierConfirmedCard message={message} supplierName={supplierName} />;

    case "ORDER_CREATED":
      return <PurchaseOrderCreatedCard message={message} onViewPO={onViewPO} />;

    case "CONSOLIDATED_PO_CREATED":
      return <ConsolidatedPoCreatedCard message={message} onViewPO={onViewPO} />;

    case "PAYMENT_RECEIVED":
      return <PaymentReceivedCard message={message} onViewReceipt={onViewReceipt} />;

    case "DELIVERY_SCHEDULED":
      return <DeliveryScheduledCard message={message} onViewTracking={onViewTracking} />;

    case "SHIPMENT_DISPATCHED":
      return <ShipmentDispatchedCard message={message} onViewTracking={onViewTracking} />;

    case "REFUND_ISSUED":
      return <RefundIssuedCard message={message} onViewReceipt={onViewReceipt} />;

    case "TEXT":
      return <MessageEventCard message={message} supplierName={supplierName} buyerName={buyerName} />;

    // FIX: previously only COUNTER_OFFER was handled here, and only rendered
    // CounterOfferCard `if (message.metadata)` — but the backend never set
    // `metadata` for either type (it JSON.stringify'd the payload into
    // `message` instead), so both silently fell through to SystemEventCard
    // printing raw JSON text. Now that rfqNegotiation.service.ts sets real
    // `metadata` (including the computed price breakdown) for both event
    // types, both render through the same CounterOfferCard, with
    // vatRate/isVatExempt passed straight through from that metadata.
    case "COUNTER_OFFER":
    case "FINAL_OFFER": {
      if (!message.metadata) {
        return <SystemEventCard message={message} />;
      }
      const meta = message.metadata;
      return (
        <CounterOfferCard
          offer={offerFromMessage(message)}
          isLatest={isLatestOffer}
          isFromSupplier={message.senderRole === "SUPPLIER"}
          supplierName={supplierName}
          buyerName={buyerName}
          onAccept={onAcceptOffer}
          onCounter={onCounterOffer}
          onReject={onRejectOffer}
          vatRate={meta.vatRate}
          isVatExempt={meta.isVatExempt}
        />
      );
    }

    case "SYSTEM":
    case "RFQ_CREATED":
    case "PRICE_ACCEPTED":
    case "PRICE_REJECTED":
    case "PAYMENT_UPDATE":
    case "PAYMENT_SUBMITTED":
    case "RECEIPT_UPLOADED":
    case "DELIVERY_UPDATED":
      return <SystemEventCard message={message} />;

    default:
      return <SystemEventCard message={message} />;
  }
}