import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart, Calendar, ImageIcon, ShieldCheck, Star, Coffee, Plane, Music, ShoppingBag, Trophy } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import confetti from 'canvas-confetti';
import TaskHeader from './task-detail/TaskHeader';
import TaskBottomBar from './task-detail/TaskBottomBar';
import TaskComments from './task-detail/TaskComments';
import taskService from '@/api/service/task';
import { TaskDetailVO } from '@/api/types';
import { formatRelativeTime } from '@/utils/date';

const icons: Record<string, React.ElementType> = {
  Gift, Heart, Star, Coffee, Plane, Music, ShoppingBag
};

const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
  pink: { bg: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-100/50 dark:border-pink-800/30' },
  cyan: { bg: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100/50 dark:border-cyan-800/30' },
  amber: { bg: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100/50 dark:border-amber-800/30' },
  emerald: { bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100/50 dark:border-emerald-800/30' },
  purple: { bg: 'from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100/50 dark:border-purple-800/30' },
  rose: { bg: 'from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100/50 dark:border-rose-800/30' },
};

export default function TaskDetail({ task, onClose, onUpdateTask, onToggleBookmark, onDeleteTask, onUnpublishTask, currentUser }: { task: any, onClose: () => void, onUpdateTask?: (taskId: string, newStatus: string) => Promise<boolean> | boolean, onToggleBookmark?: (taskId: string) => void, onDeleteTask?: (taskId: string) => void, onUnpublishTask?: (taskId: string) => void, currentUser?: string | null, key?: string }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detail, setDetail] = useState<TaskDetailVO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'complete' | 'abandon' | null;
  }>({ isOpen: false, type: null });

  const handleAction = (type: 'accept' | 'complete' | 'abandon') => {
    setConfirmModal({ isOpen: true, type });
  };

  const confirmAction = async () => {
    if (confirmModal.type && onUpdateTask) {
      let newStatus = '';
      let success = true;
      if (confirmModal.type === 'accept') newStatus = 'in-progress';
      else if (confirmModal.type === 'complete') {
        newStatus = 'completed';
        success = await onUpdateTask(task.id, newStatus) ?? true;
        
        if (success) {
          // 触发礼花动画
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
          });
          
          // 显示成功界面
          setShowSuccess(true);
          setConfirmModal({ isOpen: false, type: null });
          
          // 延迟关闭详情页，让用户看一眼成功动画
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setConfirmModal({ isOpen: false, type: null });
        }
        return;
      }
      else if (confirmModal.type === 'abandon') newStatus = 'pending'; // 放弃后回到广场
      
      success = await onUpdateTask(task.id, newStatus) ?? true;
      if (success) {
        setConfirmModal({ isOpen: false, type: null });
        onClose();
      } else {
        setConfirmModal({ isOpen: false, type: null });
      }
    } else {
      setConfirmModal({ isOpen: false, type: null });
      onClose();
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!task?.id) return;
      setDetailLoading(true);
      try {
        const res = await taskService.detail(task.id);
        if (res.success && res.data) {
          setDetail(res.data);
        } else {
          setDetail(null);
        }
      } catch (error) {
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [task?.id]);

  const displayTask = useMemo(() => {
    if (!task) return null;
    if (!detail) return task;
    return {
      ...task,
      desc: detail.description ?? task.desc,
      img: detail.coverImage || task.img,
      tags: detail.tags || task.tags || [],
      rewards: detail.rewards || task.rewards || [],
      otherImages: (detail.images || []).map((item: any) => item.imageUrl).filter(Boolean),
      deadline: detail.deadline || task.deadline,
      taskType: detail.repeatType || task.taskType,
      repeatConfig: detail.repeatConfig || task.repeatConfig,
      author: detail.publisher?.nickname || task.author,
      authorAvatar: detail.publisher?.avatar || null,
      createdAt: detail.createdAt || task.createdAt
    };
  }, [detail, task]);

  if (!displayTask) return null;

  const isMyTask = currentUser === displayTask.author;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden"
    >
      <TaskHeader 
        taskId={displayTask.id}
        isBookmarked={displayTask.isBookmarked}
        isMyTask={isMyTask}
        onClose={onClose}
        onToggleBookmark={onToggleBookmark}
        onUnpublishTask={onUnpublishTask}
        onDeleteTask={onDeleteTask}
      />

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* 封面图 */}
        <div className="relative w-full h-[45vh] flex-shrink-0 overflow-hidden">
          <img 
            src={displayTask.img} 
            alt={displayTask.title} 
            className={`w-full h-full object-cover transition-all duration-700 ${displayTask.isPrivate && !isRevealed ? 'blur-2xl scale-110' : ''}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-900"></div>
        </div>

        {/* 内容区 */}
        <div className="px-3 -mt-6 pt-8 relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl min-h-[50vh]">
        {/* 标题与作者 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 leading-tight">
            {displayTask.isPrivate && !isRevealed ? '🔒 隐私任务' : displayTask.title}
          </h1>
          
          {/* 标签 */}
          {(displayTask.tags && displayTask.tags.length > 0) || displayTask.isPrivileged || (displayTask.taskType && displayTask.taskType !== 'one-time') ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {displayTask.isPrivileged && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  特权任务
                </span>
              )}
              {displayTask.taskType && displayTask.taskType !== 'one-time' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {displayTask.taskType === 'daily' ? '每日任务' : displayTask.taskType === 'weekly' ? '每周任务' : '每月任务'}
                  {displayTask.repeatConfig && (() => {
                    try {
                      const config = typeof displayTask.repeatConfig === 'string'
                        ? JSON.parse(displayTask.repeatConfig)
                        : displayTask.repeatConfig;
                      if (config.days && config.days.length > 0) {
                        if (displayTask.taskType === 'weekly') {
                          const dayMap = ['一', '二', '三', '四', '五', '六', '日'];
                          return ` (周${config.days.map((d: number) => dayMap[d - 1]).join('、')})`;
                        } else if (displayTask.taskType === 'monthly') {
                          return ` (${config.days.join('、')}号)`;
                        }
                      }
                    } catch (e) {
                      // ignore
                    }
                    return '';
                  })()}
                </span>
              )}
              {displayTask.tags && displayTask.tags.map((tag: string, idx: number) => {
                const colors = [
                  'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
                  'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30',
                  'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
                  'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-200 dark:border-violet-500/30'
                ];
                const colorClass = colors[idx % colors.length];
                return (
                  <span key={idx} className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${colorClass}`}>
                    {tag}
                  </span>
                );
              })}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                <img src={displayTask.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayTask.author}`} alt="author" className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{displayTask.author}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {displayTask.createdAt ? `发布于 ${formatRelativeTime(displayTask.createdAt)}` : '发布者'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 隐私遮罩 */}
        {displayTask.isPrivate && !isRevealed ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border border-slate-100 dark:border-slate-700/50 my-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">这是一个隐私任务</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">内容已加密，确认后方可查看详情</p>
            </div>
            <button 
              onClick={() => setIsRevealed(true)}
              className="px-8 py-3 bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              点击解密查看
            </button>
          </div>
        ) : (
          <>
            {/* 任务详情 */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
                {detailLoading ? '正在加载任务详情...' : displayTask.desc}
              </p>
            </div>

            {/* 更多图片 */}
            {displayTask.otherImages && displayTask.otherImages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-slate-400" />
                  更多图片
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {displayTask.otherImages.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <img 
                        src={img} 
                        alt={`Other ${idx}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 任务信息卡片 */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4 mb-8 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 dark:text-slate-500">截止时间</p>
              <p className="text-sm font-medium">{displayTask.deadline || '不限时间'}</p>
            </div>
          </div>
        </div>

        {/* 奖励区块 */}
        {displayTask.rewards && displayTask.rewards.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-amber-500" />
              任务奖励
            </h3>
            <div className={displayTask.rewards.length > 2 ? "flex flex-col gap-3" : "flex flex-wrap gap-3"}>
              {displayTask.rewards.map((reward: any, idx: number) => {
                const isObj = typeof reward === 'object';
                const text = isObj ? (reward.text || reward.content) : reward;
                const color = isObj ? reward.color : 'amber';
                const iconName = isObj ? reward.icon : 'Gift';
                
                const IconComponent = icons[iconName] || Gift;
                const style = colorStyles[color] || colorStyles.amber;

                return (
                  <div key={idx} className={`flex items-center space-x-2 bg-gradient-to-r ${style.bg} ${style.text} px-4 py-2.5 rounded-xl border ${style.border} shadow-sm`}>
                    <IconComponent className="w-4 h-4" />
                    <span className="font-bold text-sm">{displayTask.isPrivate && !isRevealed ? '***' : text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 评论区 */}
        <TaskComments taskId={displayTask.id} currentUser={currentUser || null} />
        </div>
      </div>

      <TaskBottomBar 
        status={displayTask.status} 
        isMyTask={isMyTask} 
        onAction={handleAction} 
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.type === 'accept' ? '确认接受任务？' :
          confirmModal.type === 'complete' ? '确认完成任务？' :
          '确认放弃任务？'
        }
        message={
          confirmModal.type === 'accept' ? '接受后任务将进入你的"进行中"列表，要开始这个心愿吗？' :
          confirmModal.type === 'complete' ? '太棒了！确认已经完成这个心愿任务了吗？' :
          '放弃后任务将重新回到广场，确定要放弃吗？'
        }
        confirmText={
          confirmModal.type === 'accept' ? '接受' :
          confirmModal.type === 'complete' ? '已完成' :
          '放弃'
        }
        confirmColor={
          confirmModal.type === 'accept' ? 'bg-cyan-500 hover:bg-cyan-600' :
          confirmModal.type === 'complete' ? 'bg-emerald-500 hover:bg-emerald-600' :
          'bg-rose-500 hover:bg-rose-600'
        }
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: null })}
      />

      {/* 成功完成动画层 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6"
            >
              <Trophy className="w-12 h-12" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-slate-800 dark:text-white mb-2"
            >
              恭喜完成！
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 dark:text-slate-400"
            >
              又完成了一个心愿，你真棒！
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
