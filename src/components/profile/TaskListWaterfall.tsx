import React from 'react';
import { Package } from 'lucide-react';
import TaskCard from '../TaskCard';
import type { UiTask } from '@/types/task';

interface TaskListWaterfallProps {
  tasks: UiTask[];
  onSelectTask: (task: UiTask) => void;
  emptyTitle: string;
  emptyHint: string;
}

/**
 * 双列任务瀑布流 + 空状态
 */
export default function TaskListWaterfall({
  tasks,
  onSelectTask,
  emptyTitle,
  emptyHint,
}: TaskListWaterfallProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-slate-400 dark:text-slate-500">
        <Package className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">{emptyTitle}</p>
        <p className="text-xs mt-1 text-center opacity-80">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start w-full">
      <div className="w-1/2 space-y-3">
        {tasks
          .filter((_, i) => i % 2 === 0)
          .map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} />
          ))}
      </div>
      <div className="w-1/2 space-y-3">
        {tasks
          .filter((_, i) => i % 2 === 1)
          .map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} />
          ))}
      </div>
    </div>
  );
}
