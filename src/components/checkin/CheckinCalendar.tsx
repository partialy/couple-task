import React from 'react';
import { Check } from 'lucide-react';
import type { DayReward } from './types';

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

const DOT_COLORS: Record<string, string> = {
  points: 'bg-amber-400',
  wild_card: 'bg-purple-400',
  prop: 'bg-blue-400',
};

interface CheckinCalendarProps {
  year: number;
  month: number;
  cycleDays: number;
  dayRewards: DayReward[];
  checkedDates: Set<string>;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  isConsecutive: boolean;
  currentDayNumber: number;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** Monday=0 ... Sunday=6 (ISO weekday offset) */
function getFirstDayOffset(year: number, month: number) {
  const jsDay = new Date(year, month - 1, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function CheckinCalendar({
  year,
  month,
  cycleDays,
  dayRewards,
  checkedDates,
  selectedDay,
  onSelectDay,
  isConsecutive,
  currentDayNumber,
}: CheckinCalendarProps) {
  const totalDays = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);

  const now = new Date();
  const todayDate = now.getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dateKey = (d: number) => `${year}-${pad(month)}-${pad(d)}`;

  /**
   * Map a calendar date to the plan's dayNumber.
   * - Non-consecutive: fixed mapping (monthly = dayOfMonth, weekly = dayOfWeek)
   * - Consecutive: project from currentDayNumber for today/future; null for past unchecked
   */
  const getDayNumber = (dayOfMonth: number): number | null => {
    if (!isConsecutive) {
      if (cycleDays === 7) {
        const jsDay = new Date(year, month - 1, dayOfMonth).getDay();
        return jsDay === 0 ? 7 : jsDay;
      }
      return dayOfMonth <= cycleDays ? dayOfMonth : null;
    }

    const target = new Date(year, month - 1, dayOfMonth);
    const daysFromToday = Math.round((target.getTime() - todayStart.getTime()) / 86400000);

    if (daysFromToday < 0) {
      return null;
    }

    const projected = ((currentDayNumber - 1 + daysFromToday) % cycleDays) + 1;
    return projected;
  };

  const getRewardTypes = (dayOfMonth: number): string[] => {
    const dn = getDayNumber(dayOfMonth);
    if (dn === null) return [];
    const types = new Set<string>();
    dayRewards.forEach((r) => {
      if (r.dayNumber === dn) types.add(r.rewardType);
    });
    return Array.from(types);
  };

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < offset; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= totalDays; day++) {
    const isToday = isCurrentMonth && day === todayDate;
    const isChecked = checkedDates.has(dateKey(day));
    const isSelected = day === selectedDay;
    const rewardTypes = getRewardTypes(day);

    let cellClass =
      'relative flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer transition-all min-h-[44px]';

    if (isChecked) {
      cellClass += ' bg-emerald-50 dark:bg-emerald-900/30';
    } else if (isToday) {
      cellClass += ' bg-cyan-50 dark:bg-cyan-900/20 ring-2 ring-cyan-300/60 dark:ring-cyan-600/40';
    } else {
      cellClass += ' bg-slate-50/60 dark:bg-slate-700/30';
    }

    if (isSelected) {
      cellClass += ' ring-2 ring-blue-400 dark:ring-blue-500';
    }

    cells.push(
      <div key={day} className={cellClass} onClick={() => onSelectDay(day)}>
        {isChecked && (
          <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-emerald-500" />
        )}
        <span
          className={`text-xs font-bold leading-none ${
            isChecked
              ? 'text-emerald-600 dark:text-emerald-400'
              : isToday
              ? 'text-cyan-600 dark:text-cyan-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {day}
        </span>
        {rewardTypes.length > 0 && (
          <div className="flex gap-0.5 mt-1">
            {rewardTypes.map((t) => (
              <span key={t} className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[t] || 'bg-slate-300'}`} />
            ))}
          </div>
        )}
      </div>,
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
}
