import React from "react";
import { CheckCircle, Clock, ListChecks } from "lucide-react";

interface StatsCardsProps {
  total: number;
  inProgress: number;
  completed: number;
}

export default function StatsCards({
  total,
  inProgress,
  completed,
}: StatsCardsProps) {
  return (
    <div className="px-4 mt-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-cyan-50 dark:bg-cyan-500/10 p-3 rounded-2xl border border-cyan-100 dark:border-cyan-500/20">
          <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 text-xs font-medium">
            <ListChecks className="w-3.5 h-3.5" />
            <span>总数</span>
          </div>
          <div className="mt-1 text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {total}
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-500/20">
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>进行中</span>
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
            {inProgress}
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>已完成</span>
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completed}
          </div>
        </div>
      </div>
    </div>
  );
}
