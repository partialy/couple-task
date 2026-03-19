import React from "react";
import { Calendar, Star } from "lucide-react";
import { formatRelativeTime } from "@/utils/date";
import { UiTaskDetail } from "@/types/task";

interface TaskMetaProps {
  task: UiTaskDetail;
  isRevealed: boolean;
}

export default function TaskMeta({ task, isRevealed }: TaskMetaProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 leading-tight">
        {task.isPrivate && !isRevealed ? "🔒 隐私任务" : task.title}
      </h1>

      {(task.tags && task.tags.length > 0) ||
      task.isPrivileged ||
      (task.taskType && task.taskType !== "one-time") ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.isPrivileged && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 flex items-center">
              <Star className="w-3 h-3 mr-1" />
              特权任务
            </span>
          )}
          {task.taskType && task.taskType !== "one-time" && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {task.taskType === "daily"
                ? "每日任务"
                : task.taskType === "weekly"
                  ? "每周任务"
                  : "每月任务"}
              {task.repeatConfig &&
                (() => {
                  try {
                    const config =
                      typeof task.repeatConfig === "string"
                        ? JSON.parse(task.repeatConfig)
                        : task.repeatConfig;
                    if (config.days && config.days.length > 0) {
                      if (task.taskType === "weekly") {
                        const dayMap = ["一", "二", "三", "四", "五", "六", "日"];
                        return ` (周${config.days.map((d: number) => dayMap[d - 1]).join("、")})`;
                      }
                      if (task.taskType === "monthly") {
                        return ` (${config.days.join("、")}号)`;
                      }
                    }
                  } catch (e) {
                    return "";
                  }
                  return "";
                })()}
            </span>
          )}
          {task.tags &&
            task.tags.map((tag: string, idx: number) => {
              const colors = [
                "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
                "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30",
                "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
                "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
                "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-200 dark:border-violet-500/30",
              ];
              const colorClass = colors[idx % colors.length];
              return (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${colorClass}`}
                >
                  {tag}
                </span>
              );
            })}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800">
            <img
              src={
                task.authorAvatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.author}`
              }
              alt="author"
              className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {task.author}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {task.createdAt ? `发布于 ${formatRelativeTime(task.createdAt)}` : "发布者"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
