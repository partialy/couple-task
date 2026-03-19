import React from 'react';
import { Search } from 'lucide-react';

import LocationWeather from '@/components/LocationWeather';

interface SquareHeaderProps {
  onOpenBindingPage?: () => void;
  variant?: 'full' | 'searchOnly';
}

/**
 * 任务广场头部（标题/天气/搜索）
 */
export default function SquareHeader({ onOpenBindingPage, variant = 'full' }: SquareHeaderProps) {
  return (
    <>
      {/* 头部标题/天气（可选渲染） */}
      {variant !== 'searchOnly' && (
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-2xl font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
            onClick={onOpenBindingPage}
          >
            任务广场
          </h2>
          <LocationWeather />
        </div>
      )}

      {variant !== 'full' ? (
        <div className="flex space-x-2">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm"
              placeholder="搜索你们的心愿任务..."
            />
          </div>
          <button className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-2xl shadow-sm transition-colors shrink-0">
            搜索
          </button>
        </div>
      ) : null}
    </>
  );
}

