import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ChevronLeft, MoreVertical, Phone, Video } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Message, Conversation } from "../../data/messages";
import { chatService, type MessageVO } from "@/api/service/chat";
import eventBus from "@/utils/eventBus";
import { message as toast } from "@/utils/pure/message";
import { useUserStore } from "@/store/user";
import { uploadToQiniu } from "@/utils/qiniu";
import type { ChatAttachmentKind } from "@/components/ui/ChatAttachmentModal";

interface ChatRoomProps {
  conversation: Conversation;
  initialMessages: Message[];
  onBack: () => void;
  onRefreshList: () => void;
}

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
  const currentUserId = currentUser?.id ?? null;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  /** 对方连续发消息时合并 markRead，减少请求次数 */
  const markReadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPartner = conversation.kind === "partner";
  const convId = isPartner ? conversation.id : null;

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = useCallback(async () => {
    if (!isPartner || !convId || !currentUserId) return;
    const res = await chatService.listMessages(convId, 1, 80);
    if (!res.success || !res.data?.records) {
      toast.error(res.msg || "加载消息失败");
      return;
    }
    const asc = [...res.data.records].reverse();
    setMessages(asc.map((m) => apiMessageToUi(m)));
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
    }
  }, [isPartner, initialMessages]);

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
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
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
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">聊天</p>
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

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isMe={!!currentUserId && msg.senderId === currentUserId}
            avatar={
              msg.senderId === currentUserId
                ? myAvatar || "https://picsum.photos/seed/me/100/100"
                : partnerAvatar || "https://picsum.photos/seed/partner/100/100"
            }
          />
        ))}
      </div>

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
