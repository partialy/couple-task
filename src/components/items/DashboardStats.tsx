import React from 'react';
import { CreditCard, Star, Package } from 'lucide-react';

interface DashboardStatsProps {
  pointsBalance: number;
  wildcardBalance: number;
  totalItems: number;
}

export default function DashboardStats({ pointsBalance, wildcardBalance, totalItems }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 mb-2">
          <CreditCard className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-slate-800 dark:text-white">{pointsBalance}</span>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">积分余额</span>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-500 mb-2">
          <Star className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-slate-800 dark:text-white">{wildcardBalance}</span>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">万能卡</span>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mb-2">
          <Package className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-slate-800 dark:text-white">{totalItems}</span>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">持有道具</span>
      </div>
    </div>
  );
}
