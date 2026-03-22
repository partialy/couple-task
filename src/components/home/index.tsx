import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, Plus } from 'lucide-react';

import Profile from '../Profile';
import InProgress from '../InProgress';
import Messages from '../Messages';
import TaskDetail from '../TaskDetail';

import { useTaskStore } from '@/store/task';

import SquareHeader from './components/SquareHeader';
import QuickEntrances from './components/QuickEntrances';
import CategoryChips from './components/CategoryChips';
import TaskWaterfall from './components/TaskWaterfall';
import ScrollToTopFab from './components/ScrollToTopFab';
import BottomTabBar from './components/BottomTabBar';
import useScrollCollapse from './hooks/useScrollCollapse';
import { Users } from '@/api/sql_models';
import { UiTask } from '@/types/task';
import type { PublishTaskInitialData } from '@/mappers/task';

interface HomeProps {
  key?: string;
  tasks: any[];
  setTasks: (tasks: any[]) => void;
  onPublish?: () => void;
  /** 从任务详情进入编辑发布页 */
  onEditTask?: (initialData: PublishTaskInitialData) => void;
  onOpenShop?: () => void;
  onOpenItems?: () => void;
  onOpenSpecialRewards?: () => void;
  onOpenAchievements?: () => void;
  onOpenSettings?: () => void;
  onOpenPointsDetail?: () => void;
  onOpenTemplates?: () => void;
  onLogout?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn?: boolean;
  currentUser?: Users | null;
  onLoginPrompt?: () => void;
  onOpenBindingPage?: () => void;
}

export default function Home({
  tasks,
  setTasks,
  onPublish,
  onEditTask,
  onOpenShop,
  onOpenItems,
  onOpenSpecialRewards,
  onOpenAchievements,
  onOpenSettings,
  onOpenPointsDetail,
  onOpenTemplates,
  onLogout,
  activeTab,
  setActiveTab,
  isLoggedIn,
  currentUser,
  onLoginPrompt,
  onOpenBindingPage,
}: HomeProps) {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedTask, setSelectedTask] = useState<UiTask | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { acceptTask, completeTask, abandonTask, toggleBookmark } = useTaskStore();
  const { collapsed: isSquareHeaderCollapsed } = useScrollCollapse(scrollRef, {
    collapseThresholdPx: 120,
    expandThresholdPx: 80,
  });

  // Handle back button for modal
  useEffect(() => {
    if (selectedTask) {
      if (!window.history.state || window.history.state.modal !== 'taskDetail') {
        window.history.pushState({ modal: 'taskDetail' }, '', '#taskDetail');
      }

      const handlePopState = () => setSelectedTask(null);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [selectedTask?.id]);

  const handleCloseTaskDetail = () => {
    if (selectedTask) window.history.back();
  };
  const squareCollapsed = activeTab === 'square' && isSquareHeaderCollapsed;

  const renderLoginPrompt = (pageName: string) => (
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden"
    >
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'square' && (
          <motion.div
            key="square"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* 顶部区域：任务广场/天气固定显示 */}
            <div className="shrink-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
              <div className="px-3 pt-3 pb-4">
                {/* 标题/天气固定 */}
                <div className="mb-3">
                  <SquareHeader onOpenBindingPage={onOpenBindingPage} />
                </div>

                {/* 搜索框：常驻 */}
                <SquareHeader onOpenBindingPage={onOpenBindingPage} variant="searchOnly" />

                {/* 快捷入口折叠 */}
                <div
                  className={[
                    'overflow-hidden',
                    'transition-[max-height,opacity,transform] duration-600 ease-linear',
                    squareCollapsed ? 'max-h-0 opacity-0 -translate-y-2' : 'max-h-[120px] opacity-100 translate-y-0',
                  ].join(' ')}
                >
                  <QuickEntrances
                    onOpenShop={onOpenShop}
                    onOpenTemplates={onOpenTemplates}
                    onOpenAchievements={onOpenAchievements}
                  />
                </div>
              </div>
            </div>

            <CategoryChips activeCategory={activeCategory} onChange={setActiveCategory} />

            <TaskWaterfall
              scrollRef={scrollRef}
              isLoggedIn={isLoggedIn}
              tasks={tasks}
              activeCategory={activeCategory}
              onSelectTask={setSelectedTask}
              onLoginPrompt={onLoginPrompt}
              onPublish={onPublish}
            />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute inset-0 flex flex-col"
          >
            {!isLoggedIn ? (
              renderLoginPrompt('个人主页')
            ) : (
              <Profile
                onOpenShop={onOpenShop}
                onOpenItems={onOpenItems}
                onOpenSpecialRewards={onOpenSpecialRewards}
                onOpenSettings={onOpenSettings}
                onOpenPointsDetail={onOpenPointsDetail}
                tasks={tasks}
                setTasks={setTasks}
                onEditTask={onEditTask}
              />
            )}
          </motion.div>
        )}

        {activeTab === 'inprogress' && (
          <motion.div
            key="inprogress"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute inset-0 flex flex-col"
          >
            {!isLoggedIn ? (
              renderLoginPrompt('任务进度')
            ) : (
              <InProgress tasks={tasks} setTasks={setTasks} onEditTask={onEditTask} />
            )}
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0 flex flex-col"
          >
            {!isLoggedIn ? (
              renderLoginPrompt('消息列表')
            ) : (
              <Messages />
            )}
          </motion.div>
        )}
      </div>

      <ScrollToTopFab
        visible={squareCollapsed}
        onClick={() => {
          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
        onPublish={onPublish}
        onLoginPrompt={onLoginPrompt}
      />

      <AnimatePresence>
        {selectedTask && (
          <TaskDetail
            key="task-detail"
            task={selectedTask}
            onClose={handleCloseTaskDetail}
            onDeleteTask={(taskId) => {
              setTasks(tasks.filter((t) => t.id !== taskId));
              handleCloseTaskDetail();
            }}
            onUnpublishTask={(taskId) => {
              setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: 'unpublished' } : t)));
              handleCloseTaskDetail();
            }}
            onUpdateTask={async (taskId, newStatus) => {
              if (newStatus === 'in-progress') {
                const res = await acceptTask(taskId.toString());
                if (res.success) {
                  setTasks(
                    tasks.map((t) =>
                      t.id === taskId ? { ...t, status: newStatus, assignee: currentUser || '兔兔' } : t
                    )
                  );
                  return true;
                }
                return false;
              }

              if (newStatus === 'completed') {
                const res = await completeTask(taskId.toString());
                if (res.success) {
                  setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
                  return true;
                }
                return false;
              }

              if (newStatus === 'pending') {
                const res = await abandonTask(taskId.toString());
                if (res.success) {
                  setTasks(
                    tasks.map((t) => {
                      if (t.id === taskId) {
                        const updatedTask = { ...t, status: newStatus };
                        delete updatedTask.assignee;
                        return updatedTask;
                      }
                      return t;
                    })
                  );
                  setSelectedTask({ ...selectedTask, status: newStatus });
                  return true;
                }
                return false;
              }

              setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
              return true;
            }}
            onToggleBookmark={async (taskId) => {
              await toggleBookmark(taskId);
              const next =
                useTaskStore.getState().tasks.find((t) => t.id === taskId) ?? null;
              setSelectedTask(next);
            }}
            onEditTask={(initialData) => {
              setSelectedTask(null);
              if (window.history.state?.modal === 'taskDetail') {
                window.history.replaceState({ view: 'home' }, '', '#home');
              }
              onEditTask?.(initialData);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

