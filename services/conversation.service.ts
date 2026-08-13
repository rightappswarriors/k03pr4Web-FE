// services/conversation.service.ts
// Conversation & Negotiation API client — calls the NestJS backend at /agent/conversations
import { agentFetch } from "@/lib/agent-api-client";
import type {
  ConversationListItem,
  ConversationDetail,
  ConversationMessage,
  NegotiationOffer,
  SendMessageDto,
  SendOfferDto,
  AcceptOfferDto,
  RejectOfferDto,
} from "@/types/wholesale";

export const conversationApi = {
  /** GET /agent/conversations — list all conversations for the authenticated agent */
  listConversations: async (): Promise<ConversationListItem[]> => {
    return agentFetch("/agent/conversations");
  },

  /** GET /agent/conversations/unread-count — get unread message count */
  getUnreadCount: async (): Promise<number> => {
    const response = await agentFetch<{ count: number }>("/agent/conversations/unread-count");
    return response.count;
  },

  /** GET /agent/conversations/:conversationId — get full conversation detail */
  getConversation: (conversationId: string): Promise<ConversationDetail> =>
    agentFetch(`/agent/conversations/${conversationId}`),

  /** POST /agent/conversations/:conversationId/messages — send a message */
  sendMessage: (
    conversationId: string,
    data: SendMessageDto,
  ): Promise<ConversationMessage> =>
    agentFetch(`/agent/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** POST /agent/conversations/:conversationId/offer — send an offer */
  sendOffer: (
    conversationId: string,
    data: SendOfferDto,
  ): Promise<NegotiationOffer> =>
    agentFetch(`/agent/conversations/${conversationId}/offer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** POST /agent/conversations/:conversationId/accept-offer — accept an offer */
  acceptOffer: (
    conversationId: string,
    data?: AcceptOfferDto,
  ): Promise<{ success: boolean; message: string }> =>
    agentFetch(`/agent/conversations/${conversationId}/accept-offer`, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),

  /** POST /agent/conversations/:conversationId/reject-offer — reject an offer */
  rejectOffer: (
    conversationId: string,
    data?: RejectOfferDto,
  ): Promise<{ success: boolean; message: string }> =>
    agentFetch(`/agent/conversations/${conversationId}/reject-offer`, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),

  /** POST /agent/conversations/:conversationId/read — mark conversation as read */
  markConversationRead: (conversationId: string): Promise<{ success: boolean }> =>
    agentFetch(`/agent/conversations/${conversationId}/read`, {
      method: "POST",
    }),
};
