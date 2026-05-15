type Props = {
  value?: string | number | null;
};

const toneMap: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  accepted: "bg-indigo-100 text-indigo-700",
  used: "bg-emerald-100 text-emerald-700",
  unused: "bg-slate-100 text-slate-600",
  voided: "bg-rose-100 text-rose-700",
  blocked: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ value }: Props) {
  const text = String(value ?? "-");
  const key = text.toLowerCase();
  const tone = toneMap[key] || "bg-slate-100 text-slate-700";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{text}</span>;
}
