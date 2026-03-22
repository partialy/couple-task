import React from 'react';
import { Ticket } from 'lucide-react';

interface RedeemBalanceCardProps {
  cardBalance: number;
  onOpenRecords: () => void;
  onOpenHowTo: () => void;
}

export default function RedeemBalanceCard({
  cardBalance,
  onOpenRecords,
  onOpenHowTo,
}: RedeemBalanceCardProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg shadow-indigo-300/40 dark:shadow-indigo-900/40">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-black/10 blur-xl" />

      <div className="relative z-10">
        <div className="mb-1 flex items-center space-x-2">
          <Ticket className="h-4 w-4 text-indigo-200" />
          <p className="text-sm font-medium text-white/80">万能兑换卡余额</p>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-black">{cardBalance}</span>
          <span className="text-sm font-bold">张</span>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <button
            type="button"
            onClick={onOpenRecords}
            className="rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none"
          >
            获取记录
          </button>
          <button
            type="button"
            onClick={onOpenHowTo}
            className="rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none"
          >
            如何获取?
          </button>
        </div>
      </div>
    </div>
  );
}
