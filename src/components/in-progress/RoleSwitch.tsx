import React, { useRef } from "react";

type RoleTab = "my" | "ta";

interface RoleSwitchProps {
  value: RoleTab;
  onChange: (tab: RoleTab) => void;
}

export default function RoleSwitch({ value, onChange }: RoleSwitchProps) {
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    const SWIPE_THRESHOLD = 40;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX < 0) onChange("ta");
    if (deltaX > 0) onChange("my");
    touchStartXRef.current = null;
  };

  return (
    <div
      className="px-4 py-3 bg-white dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-end gap-6 h-7">
        <button
          onClick={() => onChange("my")}
          className={`transition-all ${
            value === "my"
              ? "text-indigo-600 dark:text-indigo-400 text-xl font-black"
              : "text-slate-400 dark:text-slate-500 text-base font-semibold"
          }`}
        >
          我的
        </button>
        <button
          onClick={() => onChange("ta")}
          className={`transition-all ${
            value === "ta"
              ? "text-indigo-600 dark:text-indigo-400 text-xl font-black"
              : "text-slate-400 dark:text-slate-500 text-base font-semibold"
          }`}
        >
          对方
        </button>
      </div>
    </div>
  );
}
