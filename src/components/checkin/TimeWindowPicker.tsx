import React from 'react';
import { Plus, X } from 'lucide-react';
import type { TimeWindow } from './types';

interface TimeWindowPickerProps {
  value: TimeWindow[];
  onChange: (windows: TimeWindow[]) => void;
}

/**
 * 可签到时间段选择器
 */
export default function TimeWindowPicker({ value, onChange }: TimeWindowPickerProps) {
  const addWindow = () => {
    onChange([...value, { start: '08:00', end: '12:00' }]);
  };

  const removeWindow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateWindow = (index: number, field: 'start' | 'end', val: string) => {
    const updated = value.map((w, i) => (i === index ? { ...w, [field]: val } : w));
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">签到时段</label>
      {value.map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="time"
            value={w.start}
            onChange={(e) => updateWindow(i, 'start', e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white"
          />
          <span className="text-slate-400 text-sm">—</span>
          <input
            type="time"
            value={w.end}
            onChange={(e) => updateWindow(i, 'end', e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white"
          />
          <button
            onClick={() => removeWindow(i)}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addWindow}
        className="flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emerald-600 font-medium"
      >
        <Plus className="w-4 h-4" />
        添加时段
      </button>
      {value.length === 0 && (
        <p className="text-xs text-slate-400">未设置时段限制，全天可签到</p>
      )}
    </div>
  );
}
