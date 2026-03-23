import React from "react";
import { Package, Gift } from "lucide-react";

export default function PartnerProfileMoreStats({
  usableItemCount,
  specialRewardsPublished,
}: {
  usableItemCount: number;
  specialRewardsPublished: number;
}) {
  return (
    <div className="mt-6 px-4 pb-28">
      <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">道具与特别奖励</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/80">
              <Package className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">背包道具</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">可使用数量</p>
            </div>
          </div>
          <span className="text-xl font-bold tabular-nums text-slate-800 dark:text-white">{usableItemCount}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100/80 dark:bg-pink-950/50">
              <Gift className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">特别奖励</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">在当前绑定下发布的条数</p>
            </div>
          </div>
          <span className="text-xl font-bold tabular-nums text-slate-800 dark:text-white">{specialRewardsPublished}</span>
        </div>
      </div>
    </div>
  );
}
