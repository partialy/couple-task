import React from "react";
import { ListChecks, CheckCircle2, PlayCircle, Clock } from "lucide-react";

export default function PartnerProfileTaskStats({
  published,
  receivedCompleted,
  receivedOngoing,
  receivedPending,
}: {
  published: number;
  receivedCompleted: number;
  receivedOngoing: number;
  receivedPending: number;
}) {
  const items = [
    { label: "发布的任务", value: published, icon: ListChecks, color: "text-sky-600 dark:text-sky-400" },
    { label: "已完成", value: receivedCompleted, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "进行中", value: receivedOngoing, icon: PlayCircle, color: "text-amber-600 dark:text-amber-400" },
    { label: "待接取", value: receivedPending, icon: Clock, color: "text-slate-600 dark:text-slate-400" },
  ];

  return (
    <div className="mt-4 px-4">
      <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">任务情况</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/80 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums text-slate-800 dark:text-white">{value}</p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        以「接收者」身份统计的进行中/待接取/已完成；发布数为对方作为发布者的任务总数。
      </p>
    </div>
  );
}
