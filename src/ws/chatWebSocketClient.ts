import { getChatWebSocketUrl } from "@/utils/chatWsUrl";
import { useMessageStore } from "@/store/message";
import { useUserStore } from "@/store/user";
import eventBus from "@/utils/eventBus";
import { notification } from "@/utils/pure/notification";
import type { MessageVO } from "@/api/service/chat";

/** 避免在 CONNECTING 阶段直接 close 触发浏览器 “closed before established” 警告（Strict Mode 双挂载时常见） */
export function closeWebSocketSafely(ws: WebSocket | null) {
  if (!ws) return;
  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
    return;
  }
  if (ws.readyState === WebSocket.CONNECTING) {
    const finish = () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
    ws.addEventListener("open", finish, { once: true });
    ws.addEventListener("error", finish, { once: true });
  }
}

/** Home 底栏当前 tab，由 App 同步（单例读取，避免把 WS 绑在 Messages 上） */
let homeActiveTab = "square";

export function setChatHomeActiveTab(tab: string) {
  homeActiveTab = tab;
}

let socket: WebSocket | null = null;

function previewLine(content: string, type: string): string {
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

function isViewingConversation(conversationId: string): boolean {
  const { activeChatConversationId } = useMessageStore.getState();
  return homeActiveTab === "messages" && activeChatConversationId === conversationId;
}

export function disconnectChatWebSocket() {
  closeWebSocketSafely(socket);
  socket = null;
}

/**
 * 已登录主界面时调用；内部会先断开旧连接再建连。
 */
export function connectChatWebSocket() {
  disconnectChatWebSocket();

  const url = getChatWebSocketUrl();
  try {
    socket = new WebSocket(url);
  } catch {
    useMessageStore.getState().setPartnerOnline(false);
    return;
  }

  const ws = socket;

  ws.onopen = () => {
    if (import.meta.env.DEV) {
      console.debug("[chat ws] connected");
    }
  };

  ws.onmessage = (ev) => {
    try {
      const o = JSON.parse(ev.data as string) as {
        event?: string;
        data?: { userId?: string; online?: boolean } & MessageVO;
      };

      const bindUser = useUserStore.getState().bindUser;

      if (o.event === "peerPresence" && bindUser?.id && o.data?.userId === bindUser.id) {
        useMessageStore.getState().setPartnerOnline(!!o.data.online);
        return;
      }

      if (o.event === "newMessage" && o.data?.conversationId) {
        const d = o.data;
        const viewing = isViewingConversation(d.conversationId);
        useMessageStore.getState().applyIncomingMessage({
          conversationId: d.conversationId,
          content: d.content,
          type: d.type,
          createdAt: d.createdAt,
          incrementUnread: !viewing,
        });
        eventBus.emit("CHAT_MESSAGE_INCOMING", d);

        if (!viewing) {
          const title =
            bindUser?.nickname?.trim() || bindUser?.username || "新消息";
          notification.show({
            title,
            content: previewLine(d.content, d.type),
            position: "center",
            image: bindUser?.avatar || undefined,
            onClick: () => {
              eventBus.emit("OPEN_MESSAGES_TAB");
            },
          });
        }
      }

      // 后续：taskUpdate / systemNotice 等可在此分支
    } catch {
      /* ignore */
    }
  };

  ws.onerror = () => {
    useMessageStore.getState().setPartnerOnline(false);
  };

  ws.onclose = (ev) => {
    if (import.meta.env.DEV) {
      console.debug("[chat ws] closed", ev.code, ev.reason || "");
    }
  };
}
