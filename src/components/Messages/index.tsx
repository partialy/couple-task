import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import ConversationList from "./ConversationList";
import ChatRoom from "./ChatRoom";
import { mockConversations, mockMessages } from "../../data/messages";
import { useMessageStore } from "../../store";
import { useUserStore } from "@/store/user";

export default function Messages({
}: {
  currentUser?: never;
}) {
  const currentUser = useUserStore((state) => state.currentUser);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const { conversations, setConversations, clearUnreadCount } =
    useMessageStore();

  useEffect(() => {
    // Initialize conversations from mock data if empty
    if (conversations.length === 0) {
      setConversations(mockConversations);
    }
  }, [conversations.length, setConversations]);

  useEffect(() => {
    if (activeConversationId) {
      // Clear unread count when conversation is opened
      clearUnreadCount(activeConversationId);

      // Push a dummy state with hash so back button can be intercepted in WebViews
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

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const messages = activeConversationId
    ? mockMessages[activeConversationId] || []
    : [];

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      {/* Header for Messages Tab */}
      <div className="px-4 pt-4 pb-3 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          消息
        </h2>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <ConversationList
          conversations={conversations}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Chat Room Overlay */}
      <AnimatePresence>
        {activeConversationId && activeConversation && (
          <ChatRoom
            key="chatroom"
            conversation={activeConversation}
            initialMessages={messages}
            onBack={handleBackToList}
            currentUser={currentUser?.username || null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
