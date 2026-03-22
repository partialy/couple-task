import React from "react";

export type LimitedStockAccent = "amber" | "indigo";

const accentRing: Record<LimitedStockAccent, string> = {
  amber: "focus:ring-amber-500/50",
  indigo: "focus:ring-indigo-500/50",
};

const accentToggleOn: Record<LimitedStockAccent, string> = {
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
};

interface LimitedStockFieldsProps {
  limited: boolean;
  quantity: number;
  onLimitedChange: (next: boolean) => void;
  onQuantityChange: (next: number) => void;
  /** 打开「有限库存」时默认写入的数量（如首次打开填 1） */
  defaultQuantityWhenOn?: number;
  accent?: LimitedStockAccent;
}

/**
 * 「有限库存」开关 + 数量输入（用于积分商城 / 特别奖品发布表单）
 */
export default function LimitedStockFields({
  limited,
  quantity,
  onLimitedChange,
  onQuantityChange,
  defaultQuantityWhenOn = 1,
  accent = "amber",
}: LimitedStockFieldsProps) {
  const ring = accentRing[accent];
  const knob = accentToggleOn[accent];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-white">有限库存</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            关闭则不限制兑换次数；开启后可设置对方最多可兑换次数
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={limited}
          onClick={() => {
            const next = !limited;
            onLimitedChange(next);
            if (next) {
              onQuantityChange(
                quantity >= 1 ? quantity : defaultQuantityWhenOn,
              );
            }
          }}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
            limited ? knob : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              limited ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {limited && (
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
            可兑换次数
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => {
              const v = Math.floor(Number(e.target.value));
              onQuantityChange(Number.isFinite(v) && v >= 1 ? v : 1);
            }}
            className={`w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 ${ring} text-slate-800 dark:text-white transition-all`}
          />
        </div>
      )}
    </div>
  );
}

/** 根据开关与数量得到后端 stock：不限为 -1，限量为 >=1 的整数 */
export function stockPayloadFromLimited(
  limited: boolean,
  quantity: number,
): number {
  if (!limited) return -1;
  const n = Math.floor(quantity);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
