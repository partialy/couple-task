import React from 'react';
import { Search } from 'lucide-react';

interface TemplateSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TemplateSearch({ value, onChange }: TemplateSearchProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm"
        placeholder="搜索任务模板..."
      />
    </div>
  );
}
