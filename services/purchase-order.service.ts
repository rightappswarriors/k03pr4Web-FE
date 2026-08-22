import { agentFetch } from "@/lib/agent-api-client";
import type { PurchaseOrder, PurchaseOrderDelivery } from "@/types/wholesale";

export const purchaseOrderApi = {
  list: (): Promise<PurchaseOrder[]> => agentFetch("/agent/pos"),
  get: (id: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}`),
  accept: (id: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}/accept`, { method: "POST" }),
  reject: (id: string, reason: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  preparePayment: (id: string, paymentMethod: "CARD" | "CASH" | "E_WALLET", paymentReference?: string): Promise<PurchaseOrder> => agentFetch(`/agent/pos/${id}/payment-preparation`, { method: "POST", body: JSON.stringify({ paymentMethod, paymentReference }) }),
  updateDelivery: (id: string, data: Partial<PurchaseOrderDelivery>): Promise<{ success: boolean }> => agentFetch(`/agent/pos/${id}/delivery`, { method: "PUT", body: JSON.stringify(data) }),
  sendMessage: (id: string, message: string): Promise<unknown> => agentFetch(`/agent/pos/${id}/conversation/messages`, { method: "POST", body: JSON.stringify({ message, attachments: [] }) }),
};
