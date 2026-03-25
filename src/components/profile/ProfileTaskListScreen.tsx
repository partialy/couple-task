import React from 'react';
import { motion } from 'motion/react';
import TaskListWaterfall from './TaskListWaterfall';
import type { UiTask } from '@/types/task';
import PageHeader from '@/components/ui/PageHeader';

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
      <PageHeader title={title} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-3 no-scrollbar min-h-0">
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
