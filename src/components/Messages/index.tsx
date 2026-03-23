import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import ConversationList from "./ConversationList";
import ChatRoom from "./ChatRoom";
import { mockMessages } from "../../data/messages";
import type { Conversation } from "../../data/messages";
import { useMessageStore } from "../../store";
import { useUserStore } from "@/store/user";
import { chatService, type ConversationVO } from "@/api/service/chat";

function formatListTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function previewLastMessage(vo: ConversationVO | undefined): string {
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

function buildConversationRows(
  partnerVo: ConversationVO | null,
  bindUser: { id: string; nickname?: string; username: string; avatar?: string } | null
): Conversation[] {
  const rows: Conversation[] = [];

  if (partnerVo && bindUser) {
    rows.push({
      id: partnerVo.id,
      kind: "partner",
      userId: partnerVo.peerUser.id,
      userName: partnerVo.peerUser.nickname?.trim() || bindUser.nickname?.trim() || bindUser.username,
      userAvatar: partnerVo.peerUser.avatar || bindUser.avatar || "",
      lastMessage: previewLastMessage(partnerVo),
      lastMessageTime: formatListTime(partnerVo.lastMessage?.createdAt || partnerVo.updatedAt),
      unreadCount: Number(partnerVo.unreadCount) || 0,
    });
  }

  rows.push({
    id: "system",
    kind: "system",
    userId: "system",
    userName: "系统通知",
    userAvatar: "",
    lastMessage: "任务与奖励相关通知",
    lastMessageTime: "",
    unreadCount: 0,
  });

  return rows;
}

export default function Messages({
  onOpenPartnerProfile,
}: {
  onOpenPartnerProfile?: () => void;
}) {
  const currentUser = useUserStore((state) => state.currentUser);
  const bindUser = useUserStore((state) => state.bindUser);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const {
    conversations,
    setConversations,
    clearUnreadCount,
    partnerOnline,
    setActiveChatConversationId,
  } = useMessageStore();

  useEffect(() => {
    setActiveChatConversationId(activeConversationId);
    return () => setActiveChatConversationId(null);
  }, [activeConversationId, setActiveChatConversationId]);

  const loadConversations = useCallback(async () => {
    if (!bindUser || !currentUser) {
      setConversations(buildConversationRows(null, null));
      return;
    }
    const res = await chatService.listConversations(1, 20);
    if (!res.success) {
      setConversations(buildConversationRows(null, bindUser));
      return;
    }
    let records = res.data?.records ?? [];
    if (records.length === 0) {
      const r2 = await chatService.getOrCreateWithPeer(bindUser.id);
      if (r2.success && r2.data) {
        setConversations(buildConversationRows(r2.data, bindUser));
        return;
      }
      setConversations(buildConversationRows(null, bindUser));
      return;
    }
    setConversations(buildConversationRows(records[0], bindUser));
  }, [bindUser, currentUser, setConversations]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversationId) {
      clearUnreadCount(activeConversationId);

      window.history.pushState({ modal: "chatRoom" }, "", "#chat");

      const handlePopState = () => {
        setActiveConversationId(null);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [activeConversationId, clearUnreadCount]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleBackToList = () => {
    if (activeConversationId) {
      window.history.back();
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-3 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white shrink-0">消息</h2>
        {bindUser && onOpenPartnerProfile ? (
          <button
            type="button"
            onClick={onOpenPartnerProfile}
            className="flex min-w-0 max-w-[55%] items-center gap-2 rounded-full py-1 pl-3 pr-1 transition-colors hover:bg-slate-100/90 dark:hover:bg-slate-800/80"
            aria-label="查看对方资料"
          >
            <Heart
              className={`h-4 w-4 shrink-0 ${partnerOnline ? "fill-rose-500 text-rose-500" : "text-slate-300 dark:text-slate-600"}`}
              aria-hidden
            />
            <span className="truncate text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
              {bindUser.nickname?.trim() || bindUser.username}
            </span>
            {bindUser.avatar ? (
              <img
                src={bindUser.avatar}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full border border-slate-200/80 object-cover dark:border-slate-600"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-slate-200 text-sm font-bold text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {(bindUser.nickname?.trim() || bindUser.username || "?").slice(0, 1)}
              </div>
            )}
          </button>
        ) : (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">未绑定</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <ConversationList conversations={conversations} onSelect={handleSelectConversation} />
      </div>

      <AnimatePresence>
        {activeConversationId && activeConversation && (
          <ChatRoom
            key="chatroom"
            conversation={activeConversation}
            initialMessages={activeConversation.kind === "system" ? mockMessages.system : []}
            onBack={handleBackToList}
            onRefreshList={loadConversations}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
