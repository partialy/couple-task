
type StatusTab = "in-progress" | "completed";

interface StatusTabsProps {
  value: StatusTab;
  onChange: (tab: StatusTab) => void;
}

export default function StatusTabs({ value, onChange }: StatusTabsProps) {
  return (
    <div className="px-4 mt-5">
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
        <button
          onClick={() => onChange("in-progress")}
          className={`h-10 rounded-xl text-sm font-bold transition-all ${
            value === "in-progress"
              ? "bg-indigo-500 text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          进行中
        </button>
        <button
          onClick={() => onChange("completed")}
          className={`h-10 rounded-xl text-sm font-bold transition-all ${
            value === "completed"
              ? "bg-indigo-500 text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          已完成
        </button>
      </div>
    </div>
  );
}
