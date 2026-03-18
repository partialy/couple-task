import React from 'react';
import { Message } from '../../data/messages';

interface ChatMessageProps {
  key?: React.Key;
  message: Message;
  isMe: boolean;
  avatar: string;
}

export default function ChatMessage({ message, isMe, avatar }: ChatMessageProps) {
  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        <img 
          src={avatar} 
          alt="Avatar" 
          className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${isMe ? 'ml-2' : 'mr-2'}`} 
          referrerPolicy="no-referrer"
        />
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          <div 
            className={`px-4 py-2.5 rounded-2xl ${
              isMe 
                ? 'bg-indigo-500 text-white rounded-br-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
            }`}
          >
            <p className="text-sm leading-relaxed break-words">{message.text}</p>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
