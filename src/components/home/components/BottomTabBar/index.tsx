import React, { useRef, useCallback } from 'react';
import { Clock, Compass, MessageCircle, Plus, User } from 'lucide-react';
import { useMessageStore } from '@/store/message';

/** 触屏上几乎不触发 dblclick，用两次点击间隔判断双击更可靠 */
const DOUBLE_TAP_MS = 350;

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn?: boolean;
  onPublish?: () => void;
  onLoginPrompt?: () => void;
}

/**
 * 底部导航栏（含中间发布按钮）
 */
export default function BottomTabBar({ activeTab, setActiveTab, isLoggedIn, onPublish, onLoginPrompt }: BottomTabBarProps) {
  const squareLastTapRef = useRef(0);
  const messageUnreadTotal = useMessageStore((s) =>
    s.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
  );

  const handleSquareTabClick = useCallback(() => {
    const now = Date.now();
    if (now - squareLastTapRef.current < DOUBLE_TAP_MS) {
      squareLastTapRef.current = 0;
      window.location.reload();
      return;
    }
    squareLastTapRef.current = now;
    setActiveTab('square');
  }, [setActiveTab]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl flex items-center justify-around px-3 pb-1 z-20 transition-colors shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
      <button
        type="button"
        onClick={handleSquareTabClick}
        title="连点两次刷新页面"
        className={`p-2 flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'square'
            ? 'text-cyan-500 dark:text-cyan-400'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <Compass className="w-6 h-6" strokeWidth={activeTab === 'square' ? 2.5 : 2} />
        <span className="text-[10px] font-bold">广场</span>
      </button>

      <button
        onClick={() => setActiveTab('inprogress')}
        className={`p-2 flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'inprogress'
            ? 'text-amber-500 dark:text-amber-400'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <Clock className="w-6 h-6" strokeWidth={activeTab === 'inprogress' ? 2.5 : 2} />
        <span className="text-[10px] font-bold">进行中</span>
      </button>

      <div className="relative -top-4">
        <button
          onClick={isLoggedIn ? onPublish : onLoginPrompt}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 dark:from-pink-500 dark:to-rose-500 text-white shadow-lg shadow-pink-300/40 dark:shadow-pink-900/40 flex items-center justify-center hover:scale-105 transition-transform border-4 border-white/50 dark:border-slate-800/50 backdrop-blur-md"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setActiveTab('messages')}
        className={`relative p-2 flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'messages'
            ? 'text-blue-500 dark:text-blue-400'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
        aria-label={messageUnreadTotal > 0 ? `消息，${messageUnreadTotal} 条未读` : '消息'}
      >
        <span className="relative">
          <MessageCircle className="w-6 h-6" strokeWidth={activeTab === 'messages' ? 2.5 : 2} />
          {messageUnreadTotal > 0 && (
            <span className="absolute -right-1.5 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white border-2 border-white dark:border-slate-900">
              {messageUnreadTotal > 99 ? '99+' : messageUnreadTotal}
            </span>
          )}
        </span>
        <span className="text-[10px] font-bold">消息</span>
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className={`p-2 flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'profile'
            ? 'text-indigo-500 dark:text-indigo-400'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <User className="w-6 h-6" strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
        <span className="text-[10px] font-bold">我的</span>
      </button>
    </div>
  );
}

