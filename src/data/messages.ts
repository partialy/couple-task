/** 消息页会话项（伙伴会话 + 本地系统通知） */
export type ConversationKind = "partner" | "system";

export interface Message {
  id: string;
  senderId: string;
  /** 展示用：文本或资源 URL */
  text: string;
  type?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  kind: ConversationKind;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const mockMessages: Record<string, Message[]> = {
  system: [
    {
      id: "s1",
      senderId: "system",
      text: "欢迎来到心愿任务！",
      type: "text",
      timestamp: "系统",
      isRead: true,
    },
    {
      id: "s2",
      senderId: "system",
      text: "任务与奖励相关通知将出现在这里。",
      type: "text",
      timestamp: "系统",
      isRead: true,
    },
  ],
};
