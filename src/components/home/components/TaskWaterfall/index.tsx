import React from 'react';
import { Lock, Plus } from 'lucide-react';
// @ts-ignore
import emptyStateImage from '@/assets/icon_2_256.png';

import TaskCard from '@/components/TaskCard';
import { UiTask } from '@/types/task';

interface TaskWaterfallProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  isLoggedIn?: boolean;
  tasks: UiTask[];
  activeCategory: string;
  onSelectTask: (task: UiTask) => void;
  onLoginPrompt?: () => void;
  onPublish?: () => void;
}

const categories = ['全部', '旅行', '美食', '日常', '心愿单', '纪念日'];

function splitColumns(tasks: UiTask[]) {
  const leftColumn = tasks.filter((_: UiTask, index: number) => index % 2 === 0);
  const rightColumn = tasks.filter((_: UiTask, index: number) => index % 2 !== 0);
  return { leftColumn, rightColumn };
}

function LoginPromptOverlay({ pageName, onLoginPrompt }: { pageName: string; onLoginPrompt?: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="w-24 h-24 mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
        <Lock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">尚未登录</h3>
      <p className="text-slate-400 dark:text-slate-500 text-center mb-8 text-sm">请先登录以查看{pageName}</p>
      <button
        onClick={onLoginPrompt}
        className="px-8 py-3 bg-linear-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white rounded-full font-bold shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-105 active:scale-95 transition-all"
      >
        前往登录
      </button>
    </div>
  );
}

function EmptyState({ onPublish }: { onPublish?: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-3 pb-20">
      <div className="w-40 h-40 mb-6 opacity-80">
        <img src={emptyStateImage || '/icon.png'} alt="空状态" className="object-cover" />
      </div>
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">暂无任务</h3>
      <p className="text-slate-400 dark:text-slate-500 text-center mb-8 text-sm">这里空空如也，去发布一个你们的心愿任务吧！</p>
      <button
        onClick={onPublish}
        className="px-8 py-3 bg-linear-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white rounded-full font-bold shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>立即发布</span>
      </button>
    </div>
  );
}

/**
 * 任务广场瀑布流列表（滚动容器）
 */
export default function TaskWaterfall({
  scrollRef,
  isLoggedIn,
  tasks,
  activeCategory,
  onSelectTask,
  onLoginPrompt,
  onPublish,
}: TaskWaterfallProps) {
  const pendingTasks = tasks.filter(
    (task) =>
      task.status === 'pending' && (task.listStatus ?? 'published') === 'published',
  );
  const filteredTasks = pendingTasks
    .filter((task) => activeCategory === '全部' || task.category === activeCategory)
    .sort((a, b) => {
      if (a.isPrivileged && !b.isPrivileged) return -1;
      if (!a.isPrivileged && b.isPrivileged) return 1;
      return 0;
    });

  const { leftColumn, rightColumn } = splitColumns(filteredTasks);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pb-32 no-scrollbar z-10 relative">
      {!isLoggedIn ? (
        <LoginPromptOverlay pageName="任务广场" onLoginPrompt={onLoginPrompt} />
      ) : filteredTasks.length > 0 ? (
        <div className="flex space-x-3 items-start w-full">
          <div className="w-1/2 space-y-3">
            {leftColumn.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} />
            ))}
          </div>
          <div className="w-1/2 space-y-3">
            {rightColumn.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState onPublish={onPublish} />
      )}
    </div>
  );
}

export { categories };

