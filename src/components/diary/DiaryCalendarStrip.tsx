import React, { useEffect, useMemo, useRef } from 'react';

type DayStatus = 'none' | 'half' | 'full';

interface DiaryCalendarStripProps {
  currentDate: string;
  dayStatusMap: Record<string, DayStatus>;
  onChange: (date: string) => void;
}

function monthDays(currentDate: string) {
  const d = new Date(currentDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }).map((_, idx) => {
    const day = idx + 1;
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { dateStr, day, week: '日一二三四五六'[date.getDay()] };
  });
}

function HeartStatusIcon({ status }: { status: DayStatus }) {
  if (status === 'none') return <span className="h-4 w-4" />;
  if (status === 'half') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="diaryHalfRed" x1="0" y1="0" x2="1" y2="0">
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path fill="url(#diaryHalfRed)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function DiaryCalendarStrip({ currentDate, dayStatusMap, onChange }: DiaryCalendarStripProps) {
  const days = useMemo(() => monthDays(currentDate), [currentDate]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = itemRefs.current[currentDate];
    if (!scroller || !active) return;
    const targetLeft = active.offsetLeft - scroller.clientWidth / 2 + active.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }, [currentDate]);

  return (
    <div className="relative z-20">
      <div ref={scrollerRef} className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 py-3">
        {days.map((day) => {
          const isSelected = day.dateStr === currentDate;
          const status = dayStatusMap[day.dateStr] || 'none';
          return (
            <button
              ref={(el) => {
                itemRefs.current[day.dateStr] = el;
              }}
              key={day.dateStr}
              onClick={() => onChange(day.dateStr)}
              className={`snap-center shrink-0 h-[72px] w-[52px] rounded-[1.25rem] flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold opacity-70">{day.week}</span>
              <span className="my-0.5 text-[17px] font-black">{day.day}</span>
              <HeartStatusIcon status={status} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
