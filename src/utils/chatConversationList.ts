import { chatService, type ConversationVO } from "@/api/service/chat";
import type { Conversation } from "@/data/messages";
import systemAvatar from "@/assets/icon_128.png";

export function formatListTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function previewLastMessage(vo: ConversationVO | undefined): string {
  if (!vo?.lastMessage) return "暂无消息";
  const { content, type } = vo.lastMessage;
  switch (type) {
    case "image":
      return "[图片]";
    case "video":
      return "[视频]";
    case "file":
      return "[文件]";
    default:
      return content || "";
  }
}

export function buildConversationRows(
  partnerVo: ConversationVO | null,
  bindUser: {
    id: string;
    nickname?: string;
    username: string;
    avatar?: string;
  } | null,
): Conversation[] {
  const rows: Conversation[] = [];

  if (partnerVo && bindUser) {
    rows.push({
      id: partnerVo.id,
      kind: "partner",
      userId: partnerVo.peerUser.id,
      userName:
        partnerVo.peerUser.nickname?.trim() ||
        bindUser.nickname?.trim() ||
        bindUser.username,
      userAvatar: partnerVo.peerUser.avatar || bindUser.avatar || "",
      lastLoginAt: partnerVo.peerUser.lastLoginAt,
      lastMessage: previewLastMessage(partnerVo),
      lastMessageTime: formatListTime(
        partnerVo.lastMessage?.createdAt || partnerVo.updatedAt,
      ),
      unreadCount: Number(partnerVo.unreadCount) || 0,
    });
  }

  rows.push({
    id: "system",
    kind: "system",
    userId: "system",
    userName: "系统通知",
    userAvatar: systemAvatar,
    lastMessage: "任务与奖励相关通知",
    lastMessageTime: "",
    unreadCount: 0,
  });

  return rows;
}

/**
 * 拉取伙伴会话并组装列表（与消息页一致），供 App 预拉未读角标等场景复用。
 */
export async function fetchChatConversationRows(
  bindUser: {
    id: string;
    nickname?: string;
    username: string;
    avatar?: string;
  } | null,
  currentUser: { id: string } | null,
): Promise<Conversation[]> {
  if (!bindUser || !currentUser) {
    return buildConversationRows(null, null);
  }
  const res = await chatService.listConversations(1, 20);
  if (!res.success) {
    return buildConversationRows(null, bindUser);
  }
  let records = res.data?.records ?? [];
  if (records.length === 0) {
    const r2 = await chatService.getOrCreateWithPeer(bindUser.id);
    if (r2.success && r2.data) {
      return buildConversationRows(r2.data, bindUser);
    }
    return buildConversationRows(null, bindUser);
  }
  return buildConversationRows(records[0], bindUser);
}
