import React from "react";
import { Calendar } from "lucide-react";

interface TaskInfoCardProps {
  deadline?: string;
}

export default function TaskInfoCard({ deadline }: TaskInfoCardProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4 mb-8 border border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400 dark:text-slate-500">截止时间</p>
          <p className="text-sm font-medium">{deadline || "不限时间"}</p>
        </div>
      </div>
    </div>
  );
}
