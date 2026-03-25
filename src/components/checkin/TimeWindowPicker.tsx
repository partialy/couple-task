import React from 'react';
import { Plus, X, Clock } from 'lucide-react';
import { timePicker } from '@/utils/pure/timePicker';
import type { TimeWindow } from './types';

interface TimeWindowPickerProps {
  value: TimeWindow[];
  onChange: (windows: TimeWindow[]) => void;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function parseTime(str: string) {
  const [h, m] = str.split(':').map(Number);
  return { hour: h || 0, minute: m || 0 };
}

export default function TimeWindowPicker({ value, onChange }: TimeWindowPickerProps) {
  const addWindow = () => {
    onChange([...value, { start: '08:00', end: '12:00' }]);
  };

  const removeWindow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const openPicker = (index: number, field: 'start' | 'end') => {
    const current = parseTime(value[index][field]);
    timePicker.show({
      initialTime: current,
      onSelect: ({ hour, minute }) => {
        const updated = value.map((w, i) =>
          i === index ? { ...w, [field]: `${pad(hour)}:${pad(minute)}` } : w,
        );
        onChange(updated);
      },
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">签到时段</label>
      {value.map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openPicker(i, 'start')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {w.start}
          </button>
          <span className="text-slate-400 text-sm">—</span>
          <button
            type="button"
            onClick={() => openPicker(i, 'end')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {w.end}
          </button>
          <button
            type="button"
            onClick={() => removeWindow(i)}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
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
