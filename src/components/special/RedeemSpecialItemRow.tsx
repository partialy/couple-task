import React from 'react';
import { Star } from 'lucide-react';
import {
  SpecialItem,
  specialIconMap,
  specialColorStyles,
  getSpecialItemBgClass,
} from './types';

interface RedeemSpecialItemRowProps {
  item: SpecialItem;
  cardBalance: number;
  redeemingId: string | null;
  onRequestRedeem: (item: SpecialItem) => void;
  onOpenDetail: (item: SpecialItem) => void;
}

export default function RedeemSpecialItemRow({
  item,
  cardBalance,
  redeemingId,
  onRequestRedeem,
  onOpenDetail,
}: RedeemSpecialItemRowProps) {
  const IconComponent = specialIconMap[item.icon] || Star;
  const colorKey = specialColorStyles[item.color] ? item.color : 'indigo';

  return (
    <div className="group relative flex items-center space-x-4 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
      <button
        type="button"
        aria-label={`查看详情：${item.name}`}
        onClick={() => onOpenDetail(item)}
        className={`flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${getSpecialItemBgClass(item.color)}`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <IconComponent
            className={`h-10 w-10 ${specialColorStyles[colorKey]?.text || 'text-indigo-500'}`}
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <h4 className="mb-1 truncate text-base font-bold text-slate-800 dark:text-white">
          {item.name}
        </h4>
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {item.desc}
        </p>

        <div className="flex flex-col gap-2">
          {item.stock != null && item.stock >= 0 && (
            <p className="text-[10px] font-medium text-slate-400">
              库存 {item.stock > 0 ? `剩余 ${item.stock}` : '已售罄'}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-lg font-black text-indigo-500">
                {item.cards}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                张万能卡
              </span>
            </div>
            <button
              type="button"
              disabled={
                redeemingId === item.id ||
                cardBalance < item.cards ||
                (item.stock != null && item.stock >= 0 && item.stock === 0)
              }
              onClick={() => onRequestRedeem(item)}
              className="rounded-xl bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-indigo-900/40 focus:outline-none"
            >
              {redeemingId === item.id ? '兑换中...' : '立即兑换'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
