import React from 'react';
import { Award, CalendarCheck, Star, Zap } from 'lucide-react';

interface QuickEntrancesProps {
  onOpenCheckin?: () => void;
  onOpenTemplates?: () => void;
  onOpenAchievements?: () => void;
}

type EntranceItem = {
  icon: typeof CalendarCheck;
  label: string;
  color: string;
  bg: string;
  onClick?: () => void;
};

/**
 * 广场快捷入口（四宫格）
 */
export default function QuickEntrances({ onOpenCheckin, onOpenTemplates, onOpenAchievements }: QuickEntrancesProps) {
  const items: EntranceItem[] = [
    { icon: CalendarCheck, label: '签到', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', onClick: onOpenCheckin },
    { icon: Star, label: '任务', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', onClick: onOpenTemplates },
    { icon: Award, label: '成就', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', onClick: onOpenAchievements },
    { icon: Zap, label: '动态', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mt-6 px-1">
      {items.map((item, idx) => (
        <button key={idx} onClick={item.onClick} className="flex flex-col items-center space-y-2 group">
          <div
            className={`w-full aspect-square max-w-[56px] rounded-2xl ${item.bg} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 group-active:scale-95 transition-all duration-300`}
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

