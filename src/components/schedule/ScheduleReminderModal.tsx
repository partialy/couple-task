import Modal from "@/components/ui/Modal";
import type { ScheduleItem } from "@/api/service/schedule";

interface ScheduleReminderModalProps {
  isOpen: boolean;
  reminders: ScheduleItem[];
  onClose: () => void;
  onNoRemind: () => void;
}

function formatEventTime(eventTime: string): string {
  const parts = eventTime.split(" ");
  if (parts.length >= 2) {
    return parts[1].slice(0, 5);
  }
  const date = new Date(eventTime);
  if (Number.isNaN(date.getTime())) {
    return eventTime;
  }
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function ScheduleReminderModal({
  isOpen,
  reminders,
  onClose,
  onNoRemind,
}: ScheduleReminderModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="今日日程提醒">
      <div className="space-y-3">
        {reminders.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2"
          >
            <div className="text-sm font-semibold text-slate-800 dark:text-white">
              {item.type || "未命名日程"}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatEventTime(item.eventTime)}
              {item.location ? ` · ${item.location}` : ""}
            </div>
            {item.description ? (
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {item.description}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          我知道了
        </button>
        <button
          onClick={onNoRemind}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
        >
          不再提醒
        </button>
      </div>
    </Modal>
  );
}
