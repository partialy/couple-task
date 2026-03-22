import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import TaskListWaterfall from './TaskListWaterfall';
import type { UiTask } from '@/types/task';

export interface ProfileTaskListScreenProps {
  title: string;
  tasks: UiTask[];
  onBack: () => void;
  onSelectTask: (task: UiTask) => void;
  emptyTitle: string;
  emptyHint: string;
  /** 我的接受列表：已完成卡片 FINISHED 斜带 */
  listVariant?: 'default' | 'received';
}

/**
 * 全屏任务列表（我的发布 / 我的接受）
 */
export default function ProfileTaskListScreen({
  title,
  tasks,
  onBack,
  onSelectTask,
  emptyTitle,
  emptyHint,
  listVariant = 'default',
}: ProfileTaskListScreenProps) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 pt-3 bg-white dark:bg-slate-800 shadow-sm z-10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
        <div className="w-10 h-10" aria-hidden />
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar min-h-0">
        <TaskListWaterfall
          tasks={tasks}
          onSelectTask={onSelectTask}
          emptyTitle={emptyTitle}
          emptyHint={emptyHint}
          variant={listVariant}
        />
      </div>
    </motion.div>
  );
}
