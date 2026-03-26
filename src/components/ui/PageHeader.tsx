import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  /** 页面标题 */
  title: string;
  /** 返回按钮回调，不传则隐藏返回按钮（左侧保留等宽占位） */
  onBack?: () => void;
  /** 右侧自定义插槽，不传则渲染等宽占位以保持标题居中 */
  rightSlot?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, onBack, rightSlot, className }: PageHeaderProps) {
  return (
    <div
      className={`px-2 py-2 h-[60px] flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 shrink-0 ${className || ''}`}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-10 h-10" />
      )}
      <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
      {rightSlot || <div className="w-10 h-10" />}
    </div>
  );
}
