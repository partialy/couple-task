import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ExtraSettingsProps {
  usePrivilegeCard: boolean;
  setUsePrivilegeCard: (u: boolean) => void;
  remainingCards: number;
  isPrivate: boolean;
  setIsPrivate: (p: boolean) => void;
}

export default function ExtraSettings({
  usePrivilegeCard, setUsePrivilegeCard, remainingCards,
  isPrivate, setIsPrivate
}: ExtraSettingsProps) {
  return (
    <>
      {/* 特权卡开关 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">使用特权卡</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">剩余 {remainingCards} 张，享有更高优先级和特权</p>
          </div>
        </div>
        
        <button 
          onClick={() => setUsePrivilegeCard(!usePrivilegeCard)}
          className={`w-12 h-6 rounded-full transition-colors relative ${usePrivilegeCard ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${usePrivilegeCard ? 'translate-x-6.5 left-0' : 'translate-x-0.5 left-0'}`}></div>
        </button>
      </div>

      {/* 隐私任务开关 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">隐私任务</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">打开后文字显示密文，详情内二次确认后显示</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsPrivate(!isPrivate)}
          className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${isPrivate ? 'translate-x-6.5 left-0' : 'translate-x-0.5 left-0'}`}></div>
        </button>
      </div>
    </>
  );
}
