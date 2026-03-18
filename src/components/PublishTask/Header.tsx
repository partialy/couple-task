import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  onBack: () => void;
  onPublish: () => void;
  canPublish: boolean;
  isPublishing?: boolean;
}

export default function Header({ onBack, onPublish, canPublish, isPublishing }: HeaderProps) {
  return (
    <div className="px-3 pt-3 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
      <button 
        onClick={onBack}
        className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h2 className="text-lg font-bold text-slate-800 dark:text-white">发布任务</h2>
      <button 
        onClick={onPublish}
        disabled={!canPublish || isPublishing}
        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
          canPublish && !isPublishing
            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30' 
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        }`}
      >
        {isPublishing ? '发布中...' : '发布'}
      </button>
    </div>
  );
}
