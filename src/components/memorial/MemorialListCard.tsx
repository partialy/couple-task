import React from 'react';
import MemorialGlyph from './MemorialGlyph';
import { getMemorialTheme } from './memorialTheme';
import type { MemorialRow } from './memorialTypes';
import { getMemorialSubtitle } from '@/utils/pure/calculateMemorialDays';

interface MemorialListCardProps {
  row: MemorialRow;
  index: number;
  onClick: () => void;
}

export default function MemorialListCard({ row, index, onClick }: MemorialListCardProps) {
  const theme = getMemorialTheme(row.colorThemeId);
  const subtitle = getMemorialSubtitle(row.anchorYmd, row.eventType, row.personName, row);
  const showPassed = row.eventType === 'anniversary' && row.isPast;
  const mainNum = showPassed ? row.passedDays : row.nextDays;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-[1.5rem] p-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none w-full text-left transition-all active:scale-[0.98] hover:bg-white/80 dark:hover:bg-slate-800/60"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center space-x-4 min-w-0">
        <div
          className={`w-12 h-12 rounded-[1rem] flex items-center justify-center overflow-hidden shrink-0 ${theme.iconBg}`}
        >
          <MemorialGlyph iconKey={row.iconKey || 'star'} customUrl={row.customIconUrl} className="rounded-[1rem]" />
        </div>
        <div className="min-w-0">
          <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{row.title}</h4>
          <div className="flex items-center mt-1 gap-1.5 min-w-0">
            <span className="text-[9px] px-1.5 py-0.5 rounded shrink-0 bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              {row.customCategory}
            </span>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 line-clamp-1">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="text-right pl-2 shrink-0">
        <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
          {showPassed ? '已过' : '还有'}
        </p>
        <div className="flex items-baseline justify-end text-slate-800 dark:text-slate-100">
          <span className="text-2xl font-black tabular-nums">{mainNum}</span>
          <span className="text-[10px] font-bold ml-1 text-slate-500 dark:text-slate-400">天</span>
        </div>
      </div>
    </button>
  );
}
