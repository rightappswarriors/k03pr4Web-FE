// services/rfq.service.ts
// RFQ API client — calls the NestJS backend at /agent/rfqs
import { agentFetch } from "@/lib/agent-api-client";
import type {
  RequestForQuotation,
  RfqListItem,
  CreateRfqDto,
  UpdateRfqDto,
  RfqStatus,
} from "@/types/wholesale";

export const rfqApi = {
  /** GET /agent/rfqs — list all RFQs for the authenticated agent */
  listRFQs: async (params?: { status?: RfqStatus }): Promise<RfqListItem[]> => {
    const qs = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
    return agentFetch(`/agent/rfqs${qs}`);
  },

  /** GET /agent/rfqs/:id — get a single RFQ with full detail */
  getRfq: (id: string): Promise<RequestForQuotation> =>
    agentFetch(`/agent/rfqs/${id}`),

  /** POST /agent/rfqs — create a new RFQ */
  createRfq: (data: CreateRfqDto): Promise<RequestForQuotation> =>
    agentFetch(`/agent/rfqs`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /agent/rfqs/:id — update an RFQ (status, notes, items, etc.) */
  updateRfq: (id: string, data: UpdateRfqDto): Promise<RequestForQuotation> =>
    agentFetch(`/agent/rfqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** DELETE /agent/rfqs/:id — soft-delete an RFQ (only DRAFT allowed) */
  deleteRfq: (id: string): Promise<{ success: boolean; message: string }> =>
    agentFetch(`/agent/rfqs/${id}`, { method: "DELETE" }),
};
