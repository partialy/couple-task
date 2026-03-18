import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ChevronLeft, MoreVertical, Phone, Video } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Message, Conversation } from '../../data/messages';

interface ChatRoomProps {
  key?: React.Key;
  conversation: Conversation;
  initialMessages: Message[];
  onBack: () => void;
  currentUser: string | null;
}

export default function ChatRoom({ conversation, initialMessages, onBack, currentUser }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages([...messages, newMessage]);
  };

  const chatRoomContent = (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <img src={conversation.userAvatar} alt={conversation.userName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{conversation.userName}</h3>
              <p className="text-xs text-emerald-500 font-medium">在线</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            isMe={msg.senderId === 'me'} 
            avatar={msg.senderId === 'me' ? 'https://picsum.photos/seed/me/100/100' : conversation.userAvatar}
          />
        ))}
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} />
    </motion.div>
  );

  return createPortal(chatRoomContent, document.body);
}
