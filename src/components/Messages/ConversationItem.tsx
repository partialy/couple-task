import React from 'react';
import { Conversation } from '../../data/messages';

interface ConversationItemProps {
  key?: React.Key;
  conversation: Conversation;
  onClick: () => void;
}

export default function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-none"
    >
      <div className="relative flex-shrink-0">
        <img 
          src={conversation.userAvatar} 
          alt={conversation.userName} 
          className="w-12 h-12 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </div>
        )}
      </div>
      
      <div className="ml-3 flex-1 overflow-hidden text-left">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
            {conversation.userName}
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
            {conversation.lastMessageTime}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {conversation.lastMessage}
        </p>
      </div>
    </button>
  );
}
