import request from "../request";
import { ApiResponse, PageResponse } from "../types";

export interface PeerUserVO {
  id: string;
  nickname?: string;
  avatar?: string;
}

export interface LastMessagePreviewVO {
  content: string;
  type: string;
  createdAt: string;
}

export interface ConversationVO {
  id: string;
  peerUser: PeerUserVO;
  lastMessage: LastMessagePreviewVO | null;
  unreadCount: number;
  updatedAt: string;
}

export interface MessageVO {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  isRead: number;
  createdAt: string;
}

export interface ChatSendBody {
  conversationId: string;
  type: string;
  content: string;
}

export interface ChatReadBody {
  conversationId: string;
}

export const chatService = {
  /** 与指定用户获取或创建会话（返回单条会话） */
  getOrCreateWithPeer: async (
    peerUserId: string
  ): Promise<ApiResponse<ConversationVO>> => {
    return await request.get(`/chat/conversations/with/${peerUserId}`);
  },

  listConversations: async (
    page = 1,
    size = 20
  ): Promise<ApiResponse<PageResponse<ConversationVO>>> => {
    return await request.get("/chat/conversations", { params: { page, size } });
  },

  listMessages: async (
    conversationId: string,
    page = 1,
    size = 50
  ): Promise<ApiResponse<PageResponse<MessageVO>>> => {
    return await request.get("/chat/messages", {
      params: { conversationId, page, size },
    });
  },

  send: async (body: ChatSendBody): Promise<ApiResponse<MessageVO>> => {
    return await request.post("/chat/messages/send", body);
  },

  markRead: async (body: ChatReadBody): Promise<ApiResponse<string>> => {
    return await request.post("/chat/messages/read", body);
  },
};
