import React from "react";

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeekCalendar({
  selectedDate,
  onSelectDate,
}: WeekCalendarProps) {
  const today = new Date();
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  return (
    <div className="px-4 mt-5">
      <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-3xl shadow-sm">
        {weekDates.map((date, i) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          const dayName = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all ${
                isSelected
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-110"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <span className="text-[10px] font-medium mb-1">{dayName}</span>
              <span className="text-sm font-bold">{date.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
