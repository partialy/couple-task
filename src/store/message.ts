import { create } from "zustand";
import type { Conversation } from "@/data/messages";

interface MessageState {
  conversations: Conversation[];
  partnerOnline: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setPartnerOnline: (online: boolean) => void;
  clearUnreadCount: (conversationId: string) => void;
  /** 收到新消息后更新列表项预览与未读 */
  applyIncomingMessage: (payload: {
    conversationId: string;
    content: string;
    type: string;
    createdAt: string;
    incrementUnread?: boolean;
  }) => void;
}

function previewFromType(content: string, type: string): string {
  switch (type) {
    case "image":
      return "[图片]";
    case "video":
      return "[视频]";
    case "file":
      return "[文件]";
    default:
      return content;
  }
}

function formatShortTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const useMessageStore = create<MessageState>()((set) => ({
  conversations: [],
  partnerOnline: false,
  setConversations: (conversations) => set({ conversations }),
  setPartnerOnline: (online) => set({ partnerOnline: online }),
  clearUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),
  applyIncomingMessage: ({ conversationId, content, type, createdAt, incrementUnread }) =>
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id !== conversationId || c.kind !== "partner") return c;
        const baseUnread = c.unreadCount ?? 0;
        const nextUnread =
          incrementUnread === false ? baseUnread : baseUnread + 1;
        return {
          ...c,
          lastMessage: previewFromType(content, type),
          lastMessageTime: formatShortTime(createdAt),
          unreadCount: nextUnread,
        };
      }),
    })),
}));
