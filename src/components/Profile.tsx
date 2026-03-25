import React, { useState, useEffect, useMemo } from 'react';
import { Settings, ChevronRight, Star, Gift, CreditCard, Moon, Sun, Package, ChevronLeft, QrCode, Send, Inbox, Archive, FileEdit, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';
import QrScanner from './QrScanner';
import ProfileEdit from './profile/ProfileEdit';
import ProfileTaskListScreen from './profile/ProfileTaskListScreen';
import ProfileAuditListScreen from '@/components/profile/ProfileAuditListScreen';
import {
  filterMyPublishedTasks,
  filterMyReceivedTasks,
  filterMyUnpublishedTasks,
  filterMyDraftTasks,
  filterApplyingTasks,
} from './profile/profileTaskFilters';
import RewardCenter from './RewardCenter';
import { useUserStore } from '@/store';
import { useTaskStore } from '@/store/task';
import { message } from '@/utils/pure/message';
import { UiTask } from '@/types/task';
import type { PublishTaskInitialData } from '@/mappers/task';

type TaskListScreenMode = 'published' | 'received' | 'draftbox' | 'mydrafts' | 'audit';

export default function Profile({
  onOpenItems,
  onOpenShop,
  onOpenSpecialRewards,
  onOpenSettings,
  onOpenPointsDetail,
  onOpenCheckinManage,
  tasks,
  setTasks,
  onEditTask,
  isDarkMode,
  onToggleDarkMode,
}: {
  onOpenItems?: () => void;
  onOpenShop?: () => void;
  onOpenSpecialRewards?: () => void;
  onOpenSettings?: () => void;
  onOpenPointsDetail?: () => void;
  onOpenCheckinManage?: () => void;
  tasks: UiTask[];
  setTasks: (tasks: UiTask[]) => void;
  onEditTask?: (initialData: PublishTaskInitialData) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  const { currentUser } = useUserStore();
  const toggleBookmark = useTaskStore((s) => s.toggleBookmark);
  const unpublishTaskApi = useTaskStore((s) => s.unpublishTask);
  const publishListingTaskApi = useTaskStore((s) => s.publishListingTask);
  const deleteTaskApi = useTaskStore((s) => s.deleteTask);
  const approveTaskAuditApi = useTaskStore((s) => s.approveTaskAudit);
  const rejectTaskAuditApi = useTaskStore((s) => s.rejectTaskAudit);
  const [taskListScreen, setTaskListScreen] = useState<TaskListScreenMode | null>(null);
  const [activeList, setActiveList] = useState<{ title: string, filter: (t: any) => boolean } | null>(null);
  const [selectedTask, setSelectedTask] = useState<UiTask | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showRewardCenter, setShowRewardCenter] = useState(false);

  // Handle back button for all modals in Profile
  useEffect(() => {
    const handlePopState = () => {
      if (selectedTask) {
        setSelectedTask(null);
      } else if (taskListScreen) {
        setTaskListScreen(null);
      } else if (activeList) {
        setActiveList(null);
      } else if (showScanner) {
        setShowScanner(false);
      } else if (showPersonalInfo) {
        setShowPersonalInfo(false);
      } else if (showRewardCenter) {
        setShowRewardCenter(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedTask, taskListScreen, activeList, showScanner, showPersonalInfo, showRewardCenter]);

  // Helper to push state when opening a modal
  const openModal = (setter: (val: any) => void, value: any) => {
    window.history.pushState({ modal: 'profile-sub' }, '', '#profile-sub');
    setter(value);
  };

  // Helper to close modal via history
  const closeModal = () => {
    window.history.back();
  };

  const uid = currentUser?.id;

  const publishedTasks = useMemo(
    () => filterMyPublishedTasks(tasks, uid),
    [tasks, uid],
  );
  const receivedTasks = useMemo(
    () => filterMyReceivedTasks(tasks, uid),
    [tasks, uid],
  );
  const completedTasks = useMemo(
    () =>
      uid
        ? tasks.filter((t) => t.status === 'completed' && t.receiverId === uid)
        : [],
    [tasks, uid],
  );
  const bookmarkedTasks = tasks.filter((t) => t.isBookmarked);
  const unpublishedTasks = useMemo(
    () => filterMyUnpublishedTasks(tasks, uid),
    [tasks, uid],
  );
  const draftTasks = useMemo(
    () => filterMyDraftTasks(tasks, uid),
    [tasks, uid],
  );

  const applyingTask = useMemo(
    () => filterApplyingTasks(tasks, uid),
    [tasks, uid]
  );

  const openTaskListScreen = (mode: TaskListScreenMode) => {
    window.history.pushState({ modal: 'profile-sub' }, '', '#profile-sub');
    setTaskListScreen(mode);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 no-scrollbar bg-slate-50 dark:bg-slate-900 h-full">
      {/* Header / User Info */}
      <div className="px-3 pt-3 pb-8 bg-white dark:bg-slate-800 rounded-b-[40px] shadow-sm relative">
        <div className="absolute top-12 right-6 flex items-center space-x-3 z-10">
          <button 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full"
            onClick={() => openModal(setShowScanner, true)}
          >
            <QrCode className="w-5 h-5" />
          </button>
          <button 
            onClick={onToggleDarkMode}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-5 relative">
          <div 
            className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shadow-cyan-200/50 dark:shadow-cyan-900/50 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openModal(setShowPersonalInfo, true)}
          >
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || '兔兔'}`} alt="avatar" className="w-full h-full rounded-full bg-white dark:bg-slate-800 object-cover" />
          </div>
          <div className="flex-1 min-w-0 pr-32">
            <h2 
              className="text-2xl font-bold text-slate-800 dark:text-white truncate cursor-pointer hover:opacity-80 transition-opacity inline-block max-w-full"
              onClick={() => openModal(setShowPersonalInfo, true)}
            >
              {currentUser?.nickname || currentUser?.username || '兔兔'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ID: {currentUser?.id?.substring(0, 8) || '829301'}</p>
            <div className="flex items-center mt-2 space-x-2">
              <span className="px-2.5 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-500 text-xs font-bold rounded-full whitespace-nowrap">
                {currentUser?.title || '恋爱达人'}
              </span>
              <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-500 text-xs font-bold rounded-full whitespace-nowrap">
                Lv.{currentUser?.level || 5}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between mt-8 px-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{publishedTasks.length}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">已发布</span>
          </div>
          <div className="w-px h-10 bg-slate-100 dark:bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{completedTasks.length}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">已完成</span>
          </div>
          <div className="w-px h-10 bg-slate-100 dark:bg-slate-700"></div>
          <button onClick={onOpenPointsDetail} className="flex flex-col items-center hover:scale-105 transition-transform">
            <span className="text-2xl font-black text-amber-500">{currentUser?.points || 0}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">我的积分</span>
          </button>
        </div>
      </div>

      {/* Quick Actions / Cards */}
      <div className="px-3 mt-4 grid grid-cols-2 gap-4">
        <button 
          onClick={onOpenItems}
          className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex items-center space-x-3 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">道具</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">查看/使用</p>
          </div>
        </button>
        <button 
          onClick={onOpenShop}
          className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex items-center space-x-3 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">积分商城</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">兑换好礼</p>
          </div>
        </button>
      </div>

      {/* Special Rewards / Redeem Code */}
      <div className="px-3 mt-3 grid grid-cols-2 gap-4">
        <button
          onClick={onOpenSpecialRewards}
          className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex items-center space-x-3 hover:shadow-md transition-shadow text-left border border-pink-100/50 dark:border-pink-900/20"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">特别奖励</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">特别礼物</p>
          </div>
        </button>

        <button
          onClick={() => openModal(setShowRewardCenter, true)}
          className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex items-center space-x-3 hover:shadow-md transition-shadow text-left border border-indigo-100/50 dark:border-indigo-900/20"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">兑换码</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">发布兑换码</p>
          </div>
        </button>
      </div>

      {/* 我的任务：点击进入全屏列表 */}
      <div className="px-3 mt-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white px-1">我的任务</h3>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm">
          <MenuItem
            icon={<CalendarCheck className="w-5 h-5 text-emerald-500" />}
            title="签到管理"
            onClick={onOpenCheckinManage}
          />
          <MenuItem
            icon={<Send className="w-5 h-5 text-pink-500" />}
            title="我的发布"
            count={publishedTasks.length}
            onClick={() => openTaskListScreen('published')}
          />
          <MenuItem
            icon={<Inbox className="w-5 h-5 text-cyan-500" />}
            title="我的接受"
            count={receivedTasks.length}
            onClick={() => openTaskListScreen('received')}
          />
          <MenuItem
            icon={<Star className="w-5 h-5 text-amber-500" />}
            title="我的收藏"
            count={bookmarkedTasks.length}
            onClick={() =>
              openModal(setActiveList, { title: '我的收藏', filter: (t) => t.isBookmarked })
            }
          />
          <MenuItem
            icon={<Archive className="w-5 h-5 text-slate-500" />}
            title="草稿箱"
            count={unpublishedTasks.length}
            onClick={() => openTaskListScreen('draftbox')}
          />
          <MenuItem
            icon={<FileEdit className="w-5 h-5 text-violet-500" />}
            title="我的草稿"
            count={draftTasks.length}
            onClick={() => openTaskListScreen('mydrafts')}
          />
          <MenuItem
            icon={<Star className="w-5 h-5 text-emerald-500" />}
            title="审核列表"
            count={applyingTask.length}
            onClick={() => openTaskListScreen('audit')}
          />
        </div>
      </div>

      {/* 我的发布 / 我的接受 — 全屏子页 */}
      <AnimatePresence>
        {taskListScreen === 'published' && (
          <ProfileTaskListScreen
            key="published"
            title="我的发布"
            tasks={publishedTasks}
            onBack={closeModal}
            onSelectTask={(task) => openModal(setSelectedTask, task)}
            emptyTitle="暂无发布的任务"
            emptyHint="去广场发布一条任务吧"
            listVariant="received"
          />
        )}
        {taskListScreen === 'received' && (
          <ProfileTaskListScreen
            key="received"
            title="我的接受"
            tasks={receivedTasks}
            onBack={closeModal}
            onSelectTask={(task) => openModal(setSelectedTask, task)}
            emptyTitle="暂无相关任务"
            emptyHint="接取并完成任务后，或任务完成后会出现在这里"
            listVariant="received"
          />
        )}
        {taskListScreen === 'draftbox' && (
          <ProfileTaskListScreen
            key="draftbox"
            title="草稿箱"
            tasks={unpublishedTasks}
            onBack={closeModal}
            onSelectTask={(task) => openModal(setSelectedTask, task)}
            emptyTitle="暂无下架任务"
            emptyHint="在任务详情中可将待接取任务下架，下架后会出现在这里"
            listVariant="received"
          />
        )}
        {taskListScreen === 'mydrafts' && (
          <ProfileTaskListScreen
            key="mydrafts"
            title="我的草稿"
            tasks={draftTasks}
            onBack={closeModal}
            onSelectTask={(task) => openModal(setSelectedTask, task)}
            emptyTitle="暂无草稿"
            emptyHint="在发布页可保存草稿，完善后再上架"
            listVariant="received"
          />
        )}
        {taskListScreen === 'audit' && (
          <ProfileAuditListScreen
            key="audit"
            tasks={applyingTask}
            onBack={closeModal}
            onApprove={async (taskId) => {
              const r = await approveTaskAuditApi(String(taskId));
              if (r.success) {
                message.success(r.msg || '已同意');
              } else {
                message.error(r.msg || '操作失败');
              }
              return r;
            }}
            onReject={async (taskId) => {
              const r = await rejectTaskAuditApi(String(taskId));
              if (r.success) {
                message.success(r.msg || '已拒绝');
              } else {
                message.error(r.msg || '操作失败');
              }
              return r;
            }}
          />
        )}
      </AnimatePresence>

      <div className="px-3 mt-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white px-1">更多服务</h3>
        
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm">
          <MenuItem icon={<CreditCard className="w-5 h-5 text-indigo-500" />} title="我的钱包" />
          <MenuItem icon={<Settings className="w-5 h-5 text-slate-500" />} title="通用设置" onClick={onOpenSettings} />
        </div>
      </div>

      {/* Task List Modal */}
      <AnimatePresence>
        {activeList && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-900 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 pt-3 bg-white dark:bg-slate-800 shadow-sm z-10">
              <button 
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{activeList.title}</h2>
              <div className="w-10 h-10"></div> {/* Placeholder for balance */}
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
              {tasks.filter(activeList.filter).length > 0 ? (
                <div className="flex space-x-3 items-start w-full">
                  <div className="w-1/2 space-y-3">
                    {tasks.filter(activeList.filter).filter((_, i) => i % 2 === 0).map(task => (
                      <TaskCard key={task.id} task={task} onClick={() => openModal(setSelectedTask, task)} />
                    ))}
                  </div>
                  <div className="w-1/2 space-y-3">
                    {tasks.filter(activeList.filter).filter((_, i) => i % 2 === 1).map(task => (
                      <TaskCard key={task.id} task={task} onClick={() => openModal(setSelectedTask, task)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                  <Package className="w-12 h-12 mb-4 opacity-50" />
                  <p>暂无相关任务</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Info Modal */}
      <AnimatePresence>
        {showPersonalInfo && (
          <ProfileEdit onBack={closeModal} />
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetail 
            key="task-detail"
            task={selectedTask} 
            onClose={closeModal} 
            onDeleteTask={async (taskId) => {
              const r = await deleteTaskApi(String(taskId));
              if (r.success) {
                message.success(r.msg || '已删除');
                closeModal();
              } else {
                message.error(r.msg || '删除失败');
              }
            }}
            onUnpublishTask={async (taskId) => {
              const r = await unpublishTaskApi(String(taskId));
              if (r.success) {
                message.success(r.msg || '已下架');
                closeModal();
              } else {
                message.error(r.msg || '下架失败');
              }
            }}
            onPublishListingTask={async (taskId) => {
              const r = await publishListingTaskApi(String(taskId));
              if (r.success) {
                message.success(r.msg || '已上架');
                closeModal();
              } else {
                message.error(r.msg || '上架失败');
              }
            }}
            onUpdateTask={(taskId, newStatus) => {
              setTasks(tasks.map(t => {
                if (t.id === taskId) {
                  const updatedTask = { ...t, status: newStatus };
                  return updatedTask;
                }
                return t;
              }));
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
              onEditTask?.(initialData);
            }}
          />
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <QrScanner 
            onScan={(text) => {
              alert(`扫描成功: ${text}`);
              closeModal();
            }} 
            onClose={closeModal} 
          />
        )}
      </AnimatePresence>

      {/* Reward Center Modal */}
      <AnimatePresence>
        {showRewardCenter && (
          <RewardCenter onBack={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, title, count, onClick }: { icon: React.ReactNode, title: string, count?: number, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <div className="flex items-center space-x-2">
        {count !== undefined && (
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-full">
            {count}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </button>
  );
}
