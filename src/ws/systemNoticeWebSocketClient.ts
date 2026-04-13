import { getSystemNoticeWebSocketUrl } from '@/utils/systemNoticeWsUrl';
import { useSystemNoticeStore } from '@/store/systemNotice';
import systemNoticeService, { type SystemNotice } from '@/api/service/systemNotice';
import { notification } from '@/utils/pure/notification';
import eventBus from '@/utils/eventBus';
import { useMessageStore } from '@/store/message';
import { getChatHomeActiveTab } from '@/ws/chatWebSocketClient';
import systemAvatar from '@/assets/icon_128.png';

let socket: WebSocket | null = null;

export function disconnectSystemNoticeWebSocket() {
  if (socket) {
    try { socket.close(); } catch {}
  }
  socket = null;
}

export async function hydrateSystemNoticeState() {
  const [listRes, cntRes] = await Promise.all([
    systemNoticeService.list(1, 20),
    systemNoticeService.unreadCount(),
  ]);
  if (listRes.success && listRes.data) {
    useSystemNoticeStore.getState().setNotices(listRes.data.records || []);
  }
  if (cntRes.success && cntRes.data) {
    useSystemNoticeStore.getState().setUnreadCount(cntRes.data.count || 0);
  }
}

export function connectSystemNoticeWebSocket() {
  disconnectSystemNoticeWebSocket();
  const url = getSystemNoticeWebSocketUrl();
  try {
    socket = new WebSocket(url);
  } catch {
    return;
  }
  const ws = socket;
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data as string) as { event?: string; data?: SystemNotice };
      if (msg.event === 'systemNotice' && msg.data?.id) {
        console.log('systemNotice', msg.data);
        notification.show({
          title: msg.data.title || '系统通知',
          content: msg.data.content || '你有一条新的系统通知',
          position: 'center',
          image: systemAvatar,
          onClick: () => {
            eventBus.emit('OPEN_MESSAGES_TAB');
          },
        });
        useSystemNoticeStore.getState().prependNotice(msg.data);
      }
    } catch {
      /* ignore */
    }
  };
  ws.onclose = () => {
    if (socket === ws) socket = null;
  };
}
