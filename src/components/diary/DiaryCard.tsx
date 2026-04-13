import React from 'react';
import type { DiaryRow } from './diaryTypes';
import { getMoodMeta } from './diaryMood';

interface DiaryCardProps {
  row: DiaryRow;
  currentUserId?: string;
  currentUserGender?: string;
  onClick: () => void;
}

export default function DiaryCard({ row, currentUserId, currentUserGender, onClick }: DiaryCardProps) {
  const mood = getMoodMeta(row.mood);
  const displayName = row.author?.nickname || row.author?.userName || '匿名';
  const avatar = row.author?.avatar;
  const timeText = formatTimeOnly(row.author?.time || row.updatedAt || row.createdAt || row.entryDate);
  const selfTone = currentUserGender === 'female' ? 'rose' : 'sky';
  const partnerTone = selfTone === 'rose' ? 'sky' : 'rose';
  const tone = row.userId === currentUserId ? selfTone : partnerTone;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[1.6rem] border p-5 shadow-sm backdrop-blur-xl transition-all hover:scale-[1.01] active:scale-95 ${
        tone === 'rose'
          ? 'border-rose-100/70 bg-rose-50/55 dark:border-rose-900/40 dark:bg-rose-950/20'
          : 'border-sky-100/70 bg-sky-50/55 dark:border-sky-900/40 dark:bg-sky-950/20'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 overflow-hidden rounded-full ${tone === 'rose' ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-sky-100 dark:bg-sky-900/40'}`}>
            {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : null}
          </div>
          <div>
            <div className={`text-xs font-extrabold ${tone === 'rose' ? 'text-rose-500 dark:text-rose-400' : 'text-sky-500 dark:text-sky-400'}`}>{displayName}的日记</div>
            <div className="text-[10px] font-medium text-slate-400">{timeText}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-white bg-white/80 px-2.5 py-1 dark:border-slate-600 dark:bg-slate-700/70">
          <span className="text-lg leading-none">{mood.icon}</span>
          <span className={`text-[11px] font-extrabold ${mood.color}`}>{mood.label}</span>
        </div>
      </div>
      {row.content && (
        <p className="mb-3 line-clamp-2 text-[14px] font-medium leading-relaxed text-slate-700 dark:text-slate-200">
          {row.content}
        </p>
      )}
      {row.imageUrl && (
        <div className="h-24 w-full overflow-hidden rounded-2xl">
          <img src={row.imageUrl} alt="diary" className="h-full w-full object-cover" />
        </div>
      )}
    </button>
  );
}

function formatTimeOnly(input?: string | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  const timePart = input.includes(' ') ? input.split(' ')[1] : input.split('T')[1];
  if (!timePart) return input;
  return timePart.slice(0, 5);
}
