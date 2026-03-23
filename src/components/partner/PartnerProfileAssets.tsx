import React from "react";
import { Coins, CreditCard } from "lucide-react";

export default function PartnerProfileAssets({
  points,
  cards,
}: {
  points: number;
  cards: number;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 px-4">
      <div className="rounded-2xl border border-amber-200/80 bg-linear-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm dark:border-amber-900/40 dark:from-amber-950/40 dark:to-orange-950/50">
        <div className="mb-2 flex items-center gap-2 text-amber-700/90 dark:text-amber-300/90">
          <Coins className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold">积分</span>
        </div>
        <p className="text-2xl font-black tabular-nums text-amber-600 dark:text-amber-400">{points}</p>
        <p className="mt-1 text-[11px] text-amber-800/60 dark:text-amber-200/50">当前可用</p>
      </div>
      <div className="rounded-2xl border border-violet-200/80 bg-linear-to-br from-violet-50 to-fuchsia-50/50 p-4 shadow-sm dark:border-violet-900/40 dark:from-violet-950/40 dark:to-fuchsia-950/50">
        <div className="mb-2 flex items-center gap-2 text-violet-700/90 dark:text-violet-300/90">
          <CreditCard className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold">万能卡</span>
        </div>
        <p className="text-2xl font-black tabular-nums text-violet-600 dark:text-violet-400">{cards}</p>
        <p className="mt-1 text-[11px] text-violet-800/60 dark:text-violet-200/50">可用于兑换</p>
      </div>
    </div>
  );
}
