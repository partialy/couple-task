import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import ConversationList from "./ConversationList";
import ChatRoom from "./ChatRoom";
import { mockMessages } from "../../data/messages";
import { useMessageStore } from "../../store";
import { useUserStore } from "@/store/user";
import { fetchChatConversationRows } from "@/utils/chatConversationList";

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
    const rows = await fetchChatConversationRows(bindUser, currentUser);
    setConversations(rows);
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
