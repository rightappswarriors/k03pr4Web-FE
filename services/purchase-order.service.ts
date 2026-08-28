import { agentFetch } from "@/lib/agent-api-client";
import type { PurchaseOrder, PurchaseOrderDelivery } from "@/types/wholesale";

export type PaymentAttemptResult = {
  id: string;
  transactionId: string;
  transactionStatus: string;
  provider: string;
  amount: number;
  checkoutUrl?: string;
  active?: boolean;
  confirmed?: boolean;
  canRetry?: boolean;
  reconciliationRequired?: boolean;
  message?: string;
};

export const purchaseOrderApi = {
  list: (): Promise<PurchaseOrder[]> => agentFetch("/agent/pos"),
  get: (id: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}`),
  accept: (id: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}/accept`, { method: "POST" }),
  reject: (id: string, reason: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  preparePayment: (id: string, paymentMethod: "CARD" | "CASH" | "E_WALLET", delivery: { scheduledDate: string; address: string; latitude?: number | null; longitude?: number | null; notes?: string; recipientName?: string; recipientContact?: string }, paymentReference?: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}/payment-preparation`, { method: "POST", body: JSON.stringify({ paymentMethod, paymentReference, delivery }) }),
  beginPayment: (id: string): Promise<PaymentAttemptResult> => agentFetch(`/agent/pos/${id}/payments`, { method: "POST" }),
  reconcilePayment: (transactionId: string): Promise<PaymentAttemptResult> => agentFetch(`/agent/payments/${transactionId}/reconcile`, { method: "POST" }),
  paymentStatus: (transactionId: string): Promise<{ transactionId: string; transactionStatus: string; paymentStatus?: string; poId?: string; poNumber?: string; amount: number; provider: string; reference?: string; confirmedAt?: string | null }> => agentFetch(`/agent/payments/${transactionId}/status`),
  updateDelivery: (id: string, data: Partial<PurchaseOrderDelivery>): Promise<{ success: boolean }> => agentFetch(`/agent/pos/${id}/delivery`, { method: "PUT", body: JSON.stringify(data) }),
  sendMessage: (id: string, message: string): Promise<unknown> => agentFetch(`/agent/pos/${id}/conversation/messages`, { method: "POST", body: JSON.stringify({ message, attachments: [] }) }),
};
