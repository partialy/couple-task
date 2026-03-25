import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useUserStore } from '@/store';
import { UiTask } from '@/types/task';
import { Result } from '@/api/sql_models';
import PageHeader from '@/components/ui/PageHeader';

type PendingAction = {
  taskId: string;
  action: 'approve' | 'reject';
} | null;

export default function ProfileAuditListScreen({
  tasks,
  onBack,
  onApprove,
  onReject,
}: {
  tasks: UiTask[];
  onBack: () => void;
  onApprove: (taskId: string) => Promise<Result<string>>;
  onReject: (taskId: string) => Promise<Result<string>>;
}) {
  const bindUser = useUserStore((s) => s.bindUser);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [loading, setLoading] = useState(false);

  const avatarSrc = useMemo(
    () =>
      bindUser?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${bindUser?.username || 'partner'}`,
    [bindUser?.avatar, bindUser?.username],
  );

  const currentTask = useMemo(
    () => tasks.find((t) => t.id === pendingAction?.taskId) ?? null,
    [tasks, pendingAction?.taskId],
  );

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setLoading(true);
    try {
      if (pendingAction.action === 'approve') {
        await onApprove(pendingAction.taskId);
      } else {
        await onReject(pendingAction.taskId);
      }
      setPendingAction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      <PageHeader title="审核列表" onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-slate-500 dark:text-slate-400">
            暂无待审核任务
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <img src={avatarSrc} alt="partner-avatar" className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      申请完成{task.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{task.desc}</p>
                  </div>
                </div>

                <div className="ml-3 flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setPendingAction({ taskId: task.id, action: 'approve' })}
                    className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    title="同意"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPendingAction({ taskId: task.id, action: 'reject' })}
                    className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                    title="拒绝"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!pendingAction}
        title={pendingAction?.action === 'approve' ? '确认同意该申请？' : '确认拒绝该申请？'}
        message={
          pendingAction?.action === 'approve'
            ? `确认同意“申请完成${currentTask?.title || ''}”吗？`
            : `确认拒绝“申请完成${currentTask?.title || ''}”吗？`
        }
        confirmText={loading ? '处理中...' : pendingAction?.action === 'approve' ? '同意' : '拒绝'}
        confirmColor={pendingAction?.action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setPendingAction(null)}
      />
    </motion.div>
  );
}
