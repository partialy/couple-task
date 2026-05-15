import React from 'react';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import MemorialGlyph from './MemorialGlyph';
import MemorialTransparentHeader from './MemorialTransparentHeader';
import { getMemorialTheme } from './memorialTheme';
import type { MemorialRow } from './memorialTypes';
import { getMemorialSubtitle } from '@/utils/pure/calculateMemorialDays';

interface MemorialDetailPanelProps {
  row: MemorialRow;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MemorialDetailPanel({ row, onBack, onEdit, onDelete }: MemorialDetailPanelProps) {
  const theme = getMemorialTheme(row.colorThemeId);
  const subtitle = getMemorialSubtitle(row.anchorYmd, row.eventType, row.personName, row);
  const isCountUp = row.eventType === 'anniversary' && row.isPast;
  const mainNumber = isCountUp ? row.passedDays : row.nextDays;
  const prefixText = isCountUp ? '已过去' : '距离目标还有';

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="absolute inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-[0.08] dark:opacity-[0.15]`} />
      <div
        className={`pointer-events-none absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-br ${theme.bg} rounded-full mix-blend-multiply opacity-30 blur-3xl`}
      />

      <MemorialTransparentHeader
        variant="sides"
        left={
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
        right={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDelete}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md text-rose-500 transition-colors hover:bg-rose-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col items-center px-6 pb-10 overflow-y-auto no-scrollbar relative z-10">
        <div
          className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl overflow-hidden ${theme.iconBg}`}
        >
          <MemorialGlyph iconKey={row.iconKey || 'star'} customUrl={row.customIconUrl} className="rounded-[1.5rem]" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white text-center mb-2">{row.title}</h2>
        <div className="inline-flex items-center px-4 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full mb-8 shadow-sm border border-white dark:border-slate-700 max-w-full">
          <span className={`w-2 h-2 rounded-full mr-2 shrink-0 bg-gradient-to-br ${theme.bg}`} />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 line-clamp-2">{subtitle}</p>
        </div>

        <div className="relative w-56 h-56 flex flex-col items-center justify-center mb-6">
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200/60 dark:text-slate-700/60" />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="301.59"
              strokeDashoffset={isCountUp ? '75' : '120'}
              className="text-cyan-500 dark:text-cyan-400 transition-all duration-700 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{prefixText}</span>
          <div className="flex items-baseline">
            <span className={`text-6xl font-black tracking-tighter bg-gradient-to-br ${theme.bg} bg-clip-text text-transparent tabular-nums`}>
              {mainNumber}
            </span>
          </div>
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1">DAYS</span>
        </div>

        {row.note && (
          <div className="w-full bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-3xl p-5 shadow-sm">
            <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">备忘录</h3>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{row.note}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
