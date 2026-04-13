import React from 'react';
import { Award, CalendarCheck, CalendarDays, Star, Zap, Heart, Bookmark, CalendarHeart } from 'lucide-react';

interface QuickEntrancesProps {
  onOpenCheckin?: () => void;
  onOpenTemplates?: () => void;
  onOpenAchievements?: () => void;
  onOpenSchedule?: () => void;
  onOpenMemorial?: () => void;
  onOpenWish?: () => void;
  onOpenMoments?: () => void;
}

type EntranceItem = {
  icon: typeof CalendarCheck;
  label: string;
  color: string;
  bg: string;
  onClick?: () => void;
};

/**
 * 广场快捷入口（双排八宫格）
 */
export default function QuickEntrances({
  onOpenCheckin,
  onOpenTemplates,
  onOpenAchievements,
  onOpenSchedule,
  onOpenMemorial,
  onOpenWish,
  onOpenMoments,
}: QuickEntrancesProps) {
  const row1: EntranceItem[] = [
    { icon: CalendarCheck, label: '签到', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', onClick: onOpenCheckin },
    { icon: Star, label: '任务', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', onClick: onOpenTemplates },
    { icon: Award, label: '成就', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', onClick: onOpenAchievements },
    { icon: Zap, label: '动态', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', onClick: onOpenMoments },
  ];

  const row2: EntranceItem[] = [
    { icon: CalendarDays, label: '日程', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', onClick: onOpenSchedule },
    { icon: CalendarHeart, label: '倒数日', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', onClick: onOpenMemorial },
    { icon: Heart, label: '心愿', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', onClick: onOpenWish },
    { icon: Bookmark, label: '收藏', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ];

  const renderRow = (items: EntranceItem[], keyPrefix: string) => (
    <div className="grid grid-cols-4 gap-4 px-1">
      {items.map((item, idx) => (
        <button key={`${keyPrefix}-${idx}`} onClick={item.onClick} className="flex flex-col items-center space-y-2 group">
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

  return (
    <div className="mt-6 space-y-4">
      {renderRow(row1, 'r1')}
      {renderRow(row2, 'r2')}
    </div>
  );
}

