import React from 'react';
import MemorialGlyph from './MemorialGlyph';
import { getMemorialTheme } from './memorialTheme';
import type { MemorialRow } from './memorialTypes';
import { getMemorialSubtitle } from '@/utils/pure/calculateMemorialDays';

interface MemorialHeroCardProps {
  row: MemorialRow;
  onClick: () => void;
}

export default function MemorialHeroCard({ row, onClick }: MemorialHeroCardProps) {
  const theme = getMemorialTheme(row.colorThemeId);
  /** 大卡片副标题：纪念日只展示目标日，避免与主倒计时重复 */
  const footerText =
    row.eventType === 'anniversary'
      ? `目标日: ${row.anchorYmd.slice(0, 10)}`
      : getMemorialSubtitle(row.anchorYmd, row.eventType, row.personName, row);

  const isAnniversaryPast = row.eventType === 'anniversary' && row.isPast;
  const mainNum = row.nextDays;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-[2rem] p-6 text-left text-white shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] w-full transition-transform active:scale-[0.98] bg-gradient-to-br ${theme.bg}`}
    >
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center space-x-2 bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <MemorialGlyph iconKey={row.iconKey} customUrl={row.customIconUrl} className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase truncate max-w-[140px]">
            {row.customCategory}
          </span>
        </div>
        {row.isPinned === 1 && (
          <span className="text-[11px] font-extrabold tracking-wider uppercase bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm shrink-0">
            置顶
          </span>
        )}
      </div>

      <div className="relative z-10 mt-8">
        <h2 className="text-lg font-bold opacity-95 line-clamp-2">{row.title}</h2>
        {isAnniversaryPast ? (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold opacity-90 leading-snug">
              距第 <span className="font-black text-lg">{row.nth}</span> 周年还有
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter tabular-nums leading-none">{mainNum}</span>
              <span className="text-lg font-bold opacity-90">天</span>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline mt-1">
            <span className="text-sm font-medium opacity-80 mr-2">还有</span>
            <span className="text-6xl font-black tracking-tighter tabular-nums">{mainNum}</span>
            <span className="text-sm font-medium opacity-80 ml-2">天</span>
          </div>
        )}
        <div className="mt-3 inline-flex items-center px-3 py-1 bg-black/10 rounded-full max-w-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 mr-2 animate-pulse shrink-0" />
          <p className="text-xs font-bold opacity-90 line-clamp-2">{footerText}</p>
        </div>
      </div>
    </button>
  );
}
