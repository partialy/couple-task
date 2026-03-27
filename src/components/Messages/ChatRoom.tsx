import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ChevronLeft, Loader2, MoreVertical, Phone, Video } from "lucide-react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Message, Conversation } from "../../data/messages";
import { chatService, type MessageVO } from "@/api/service/chat";
import eventBus from "@/utils/eventBus";
import { message as toast } from "@/utils/pure/message";
import { useUserStore } from "@/store/user";
import { useMessageStore } from "@/store/message";
import { uploadToQiniu } from "@/utils/qiniu";
import type { ChatAttachmentKind } from "@/components/ui/ChatAttachmentModal";
import AndroidPadding from "../ui/AndroidPadding";

interface ChatRoomProps {
  conversation: Conversation;
  initialMessages: Message[];
  onBack: () => void;
  onRefreshList: () => void;
}

const PAGE_SIZE = 100;
const START_INDEX = 100_000;

interface VirtuosoCtx {
  loadingMore: boolean;
  hasMore: boolean;
  count: number;
}

const StableScroller = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function VirtuosoScroller(props, ref) {
    return <div {...props} ref={ref} className={`${props.className ?? ""} no-scrollbar`} />;
  },
);

function StableHeader({ context }: { context?: VirtuosoCtx }) {
  if (!context) return null;
  if (context.loadingMore) {
    return (
      <div className="flex items-center justify-center py-3">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <span className="ml-2 text-xs text-slate-400">加载更多...</span>
      </div>
    );
  }
  if (!context.hasMore && context.count > 0) {
    return (
      <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
        没有更多消息了
      </div>
    );
  }
  return null;
}

const virtuosoComponents = {
  Scroller: StableScroller,
  Header: StableHeader,
};

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function apiMessageToUi(m: MessageVO): Message {
  return {
    id: m.id,
    senderId: m.senderId,
    text: m.content,
    type: m.type,
    timestamp: formatMsgTime(m.createdAt),
    isRead: m.isRead === 1,
  };
}

export default function ChatRoom({
  conversation,
  initialMessages,
  onBack,
  onRefreshList,
}: ChatRoomProps) {
  const currentUser = useUserStore((s) => s.currentUser);
  const bindUser = useUserStore((s) => s.bindUser);
  const partnerOnline = useMessageStore((s) => s.partnerOnline);
  const currentUserId = currentUser?.id ?? null;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isPartner = conversation.kind === "partner";
  const convId = isPartner ? conversation.id : null;
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const markReadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** true = 首次历史加载完毕，已可渲染；false = 还在加载中 */
  const [historyReady, setHistoryReady] = useState(!isPartner);

  const loadHistory = useCallback(async () => {
    if (!isPartner || !convId || !currentUserId) return;
    const res = await chatService.listMessages(convId, 1, PAGE_SIZE);
    if (!res.success || !res.data?.records) {
      toast.error(res.msg || "加载消息失败");
      setHistoryReady(true);
      return;
    }
    const asc = [...res.data.records].reverse();
    const uiMessages = asc.map((m) => apiMessageToUi(m));
    setMessages(uiMessages);
    setFirstItemIndex(START_INDEX);
    setCurrentPage(1);
    const totalRecords = res.data.total ?? 0;
    setHasMore(uiMessages.length < totalRecords);
    setHistoryReady(true);
    await chatService.markRead({ conversationId: convId });
    onRefreshList();
  }, [isPartner, convId, currentUserId, onRefreshList]);

  useEffect(() => {
    if (isPartner && convId) {
      void loadHistory();
    }
  }, [isPartner, convId, loadHistory]);

  useEffect(() => {
    if (!isPartner) {
      setMessages(initialMessages);
      setFirstItemIndex(START_INDEX);
      setCurrentPage(1);
      setHasMore(false);
    }
  }, [isPartner, initialMessages]);

  const loadMore = useCallback(async () => {
    if (!isPartner || !convId || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await chatService.listMessages(convId, nextPage, PAGE_SIZE);
      if (!res.success || !res.data?.records || res.data.records.length === 0) {
        setHasMore(false);
        return;
      }
      const olderAsc = [...res.data.records].reverse();
      const olderUi = olderAsc.map((m) => apiMessageToUi(m));
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = olderUi.filter((m) => !existingIds.has(m.id));
        return [...fresh, ...prev];
      });
      setFirstItemIndex((prev) => prev - olderUi.length);
      setCurrentPage(nextPage);
      const total = res.data.total ?? 0;
      const loaded = nextPage * PAGE_SIZE;
      setHasMore(loaded < total);
    } catch {
      toast.error("加载更多消息失败");
    } finally {
      setLoadingMore(false);
    }
  }, [isPartner, convId, hasMore, loadingMore, currentPage]);

  useEffect(() => {
    if (!isPartner || !convId || !currentUserId) return;

    const scheduleMarkRead = () => {
      if (markReadDebounceRef.current) {
        clearTimeout(markReadDebounceRef.current);
      }
      markReadDebounceRef.current = setTimeout(() => {
        markReadDebounceRef.current = null;
        void (async () => {
          await chatService.markRead({ conversationId: convId });
          onRefreshList();
        })();
      }, 250);
    };

    const handler = (payload: MessageVO) => {
      if (payload.conversationId !== convId) return;
      const fromPeer = payload.senderId !== currentUserId;
      setMessages((prev) => {
        if (prev.some((p) => p.id === payload.id)) return prev;
        return [...prev, apiMessageToUi(payload)];
      });
      if (fromPeer) {
        scheduleMarkRead();
      } else {
        onRefreshList();
      }
    };
    eventBus.on("CHAT_MESSAGE_INCOMING", handler);
    return () => {
      if (markReadDebounceRef.current) {
        clearTimeout(markReadDebounceRef.current);
        markReadDebounceRef.current = null;
      }
      eventBus.off("CHAT_MESSAGE_INCOMING", handler);
    };
  }, [isPartner, convId, currentUserId, onRefreshList]);

  useEffect(() => {
    if (!isPartner || !convId || !currentUserId) return;

    const onPeerRead = (payload: { conversationId: string; readByUserId: string }) => {
      if (payload.conversationId !== convId) return;
      if (payload.readByUserId === currentUserId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === currentUserId ? { ...m, isRead: true } : m,
        ),
      );
    };

    eventBus.on("CHAT_CONVERSATION_READ", onPeerRead);
    return () => {
      eventBus.off("CHAT_CONVERSATION_READ", onPeerRead);
    };
  }, [isPartner, convId, currentUserId]);

  const handleSendMessage = async (text: string) => {
    if (!isPartner || !convId || !currentUserId) return;
    const res = await chatService.send({
      conversationId: convId,
      type: "text",
      content: text,
    });
    if (!res.success || !res.data) {
      toast.error(res.msg || "发送失败");
      return;
    }
    const ui = apiMessageToUi(res.data);
    setMessages((prev) => [...prev, ui]);
    onRefreshList();
  };

  const handleSendAttachments = async (type: ChatAttachmentKind, files: File[]) => {
    if (!isPartner || !convId || !currentUserId || files.length === 0) return;
    let failed = 0;
    const total = files.length;
    const uploadTimeout = 60 * 60 * 1000;
    for (let i = 0; i < total; i++) {
      const file = files[i];
      try {
        const url = await uploadToQiniu(file, "chat", { timeout: uploadTimeout });
        const res = await chatService.send({
          conversationId: convId,
          type,
          content: url,
        });
        if (!res.success || !res.data) {
          toast.error(res.msg || `第 ${i + 1}/${total} 个发送失败`);
          failed++;
          continue;
        }
        setMessages((prev) => [...prev, apiMessageToUi(res.data)]);
      } catch (e) {
        console.error(e);
        toast.error(`第 ${i + 1}/${total} 个上传失败`);
        failed++;
      }
    }
    onRefreshList();
    if (failed === 0) {
      toast.success(total === 1 ? "已发送" : `已发送 ${total} 条`);
    } else if (failed < total) {
      toast.error(`${failed} 个未成功，其余已发送`);
    } else {
      toast.error("全部发送失败");
    }
  };

  const partnerAvatar = bindUser?.avatar || conversation.userAvatar;
  const myAvatar = currentUser?.avatar || "";
  const displayName = conversation.userName;

  const chatRoomContent = (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-100 bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      <AndroidPadding />
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 min-w-0">
            {conversation.userAvatar ? (
              <img
                src={conversation.userAvatar}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                {displayName.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-white leading-tight truncate">{displayName}</h3>
              {isPartner ? (
                <p className="flex items-center gap-1 text-xs font-medium">
                  <span className={`inline-block w-2 h-2 rounded-full ${partnerOnline ? "bg-green-500" : "bg-slate-400"}`} />
                  <span className={partnerOnline ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}>
                    {partnerOnline ? "在线" : "离线"}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">系统</p>
              )}
            </div>
          </div>
        </div>
        {isPartner ? (
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        ) : null}
      </div>

      {historyReady ? (
        <Virtuoso
          ref={virtuosoRef}
          className="flex-1 no-scrollbar"
          style={{ overscrollBehavior: "contain" }}
          data={messages}
          context={{ loadingMore, hasMore, count: messages.length } satisfies VirtuosoCtx}
          firstItemIndex={firstItemIndex}
          initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
          followOutput="smooth"
          startReached={() => {
            if (hasMore && !loadingMore) {
              void loadMore();
            }
          }}
          components={virtuosoComponents}
          itemContent={(_index, msg) => (
            <div className="px-4 py-2">
              <ChatMessage
                message={msg}
                isMe={!!currentUserId && msg.senderId === currentUserId}
                avatar={
                  msg.senderId === currentUserId
                    ? myAvatar || "https://picsum.photos/seed/me/100/100"
                    : partnerAvatar || "https://picsum.photos/seed/partner/100/100"
                }
              />
            </div>
          )}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {isPartner ? (
        <ChatInput
          onSend={(t) => void handleSendMessage(t)}
          onSendAttachments={(type, files) => void handleSendAttachments(type, files)}
        />
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 text-center text-sm text-slate-500">
          系统通知仅支持查看
        </div>
      )}
    </motion.div>
  );

  return createPortal(chatRoomContent, document.body);
}
