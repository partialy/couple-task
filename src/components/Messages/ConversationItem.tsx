import React, { useMemo } from "react";
import { Bell } from "lucide-react";
import { Conversation } from "../../data/messages";

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

export default function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const isSystem = conversation.kind === "system";
  const hasUnread = conversation.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-none"
    >
      <div className="relative shrink-0">
        {conversation.userAvatar && !isSystem ? (
          <img
            src={conversation.userAvatar}
            alt={conversation.userName}
            className="w-12 h-12 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : isSystem ? (
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Bell className="w-6 h-6" aria-hidden />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-200">
            {conversation.userName.slice(0, 1)}
          </div>
        )}
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </div>
        )}
      </div>

      <div className="ml-3 flex-1 overflow-hidden text-left">
        <div className="flex justify-between items-start mb-0.5">
          <div className="min-w-0 pr-2">
            <h3
              className={`truncate ${
                hasUnread
                  ? "font-bold text-slate-900 dark:text-white"
                  : "font-bold text-slate-800 dark:text-slate-200"
              }`}
            >
              {conversation.userName}
            </h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 pt-0.5">
            {conversation.lastMessageTime}
          </span>
        </div>
        <p
          className={`truncate text-sm ${
            hasUnread
              ? "font-semibold text-slate-700 dark:text-slate-200"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {conversation.lastMessage}
        </p>
      </div>
    </button>
  );
}
