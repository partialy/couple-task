import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
}

export default function DatePicker({ value, onChange, onClose }: DatePickerProps) {
  const initialDate = value ? new Date(value) : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year - 1, month, 1));
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year + 1, month, 1));
  };

  const handleDateClick = (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    const newDate = new Date(year, month, day);
    const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    onChange(formatted);
    onClose();
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isSelected = value && value === `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
    
    days.push(
      <button
        key={i}
        onClick={(e) => handleDateClick(e, i)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
          isSelected 
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' 
            : isToday
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        {i}
      </button>
    );
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); onClose(); }}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-4 bottom-full mb-2 z-20 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 flex flex-col w-[260px] origin-bottom-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex space-x-1">
            <button onClick={handlePrevYear} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-white">
            {year}年 {month + 1}月
          </div>
          <div className="flex space-x-1">
            <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={handleNextYear} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* 小箭头 */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700 rotate-45"></div>
      </motion.div>
    </>
  );
}
