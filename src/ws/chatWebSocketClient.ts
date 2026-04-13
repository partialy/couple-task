import { getChatWebSocketUrl } from "@/utils/chatWsUrl";
import { useMessageStore } from "@/store/message";
import { useUserStore } from "@/store/user";
import eventBus from "@/utils/eventBus";
import { notification } from "@/utils/pure/notification";
import { chatService, type MessageVO } from "@/api/service/chat";
import { message } from "@/utils/pure/message";

/** 避免在 CONNECTING 阶段直接 close 触发浏览器 "closed before established" 警告（Strict Mode 双挂载时常见） */
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

export function getChatHomeActiveTab() {
  return homeActiveTab;
}

let socket: WebSocket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
/** 主动调用 disconnect 时置为 true，阻止自动重连 */
let intentionalClose = false;

const HEARTBEAT_INTERVAL = 10_000;
const RECONNECT_MAX_ATTEMPTS = 10;
const RECONNECT_BASE_DELAY = 2_000;
const RECONNECT_MAX_DELAY = 30_000;

function clearHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function clearReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function startHeartbeat(ws: WebSocket) {
  clearHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const peerUserId = localStorage.getItem('bindUserId') || null;
      ws.send(
        JSON.stringify({
          event: "ping",
          data: { peerUserId: peerUserId || null },
        }),
      );
    }
  }, HEARTBEAT_INTERVAL);
}

function scheduleReconnect() {
  if (intentionalClose) return;
  if (reconnectAttempts >= RECONNECT_MAX_ATTEMPTS) {
    if (import.meta.env.DEV) {
      console.debug("[chat ws] 重连次数已达上限，停止重连");
    }
    return;
  }
  const delay = Math.min(
    RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
    RECONNECT_MAX_DELAY,
  );
  reconnectAttempts++;
  if (import.meta.env.DEV) {
    console.debug(`[chat ws] ${delay}ms 后第 ${reconnectAttempts} 次重连`);
  }
  clearReconnect();
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectChatWebSocket(true);
  }, delay);
}

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
  intentionalClose = true;
  clearHeartbeat();
  clearReconnect();
  closeWebSocketSafely(socket);
  socket = null;
}

/**
 * 已登录主界面时调用；内部会先断开旧连接再建连。
 * @param isReconnect 内部重连调用时为 true，跳过主动断开流程
 */
export function connectChatWebSocket(isReconnect = false) {
  if (!isReconnect) {
    disconnectChatWebSocket();
    reconnectAttempts = 0;
  }
  intentionalClose = false;

  const url = getChatWebSocketUrl();
  try {
    socket = new WebSocket(url);
  } catch {
    useMessageStore.getState().setPartnerOnline(false);
    scheduleReconnect();
    return;
  }

  const ws = socket;

  ws.onopen = () => {
    reconnectAttempts = 0;
    if (import.meta.env.DEV) {
      console.debug("[chat ws] connected");
    }
    if (!isReconnect) {
      message.success("websocket 已连接");
    }

    startHeartbeat(ws);

    const bindUserId = useUserStore.getState().bindUser?.id;
    if (!bindUserId) {
      useMessageStore.getState().setPartnerOnline(false);
      return;
    }
    void (async () => {
      const res = await chatService.getPresence(bindUserId);
      if (socket !== ws) return;
      if (res.success && res.data?.userId === bindUserId) {
        useMessageStore.getState().setPartnerOnline(!!res.data.online);
        return;
      }
      useMessageStore.getState().setPartnerOnline(false);
    })();
  };

  ws.onmessage = (ev) => {
    try {
      const o = JSON.parse(ev.data as string) as {
        event?: string;
        data?: { userId?: string; online?: boolean; partnerOnline?: boolean } & MessageVO;
      };

      if (o.event === "pong" && o.data) {
        useMessageStore.getState().setPartnerOnline(!!o.data.partnerOnline);
        return;
      }

      let bindUser = useUserStore.getState().bindUser;

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
          void (async () => {
            if (!bindUser) {
              await useUserStore.getState().fetchUserDetail();
              bindUser = useUserStore.getState().bindUser;
            }
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
          })();
        }
      }

      if (o.event === "conversationRead") {
        const readData = o.data as { conversationId?: string; readByUserId?: string } | undefined;
        if (readData?.conversationId && readData?.readByUserId) {
          eventBus.emit("CHAT_CONVERSATION_READ", {
            conversationId: readData.conversationId,
            readByUserId: readData.readByUserId,
          });
        }
      }
    } catch {
      /* ignore */
    }
  };

  ws.onerror = () => {
    useMessageStore.getState().setPartnerOnline(false);
    if (!isReconnect) {
      message.error("websocket 出错");
    }
  };

  ws.onclose = (ev) => {
    clearHeartbeat();
    if (import.meta.env.DEV) {
      console.debug("[chat ws] closed", ev.code, ev.reason || "");
    }
    if (socket === ws) {
      socket = null;
    }
    scheduleReconnect();
  };
}
