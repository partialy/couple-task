import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Heart, Share2, MoreHorizontal } from 'lucide-react';

interface TaskHeaderProps {
  taskId: string | number;
  isBookmarked: boolean;
  isMyTask: boolean;
  /** 任务流程状态 pending / in-progress / completed */
  taskStatus?: string;
  /** draft / published / unpublished */
  listStatus?: string;
  onClose: () => void;
  onToggleBookmark?: (taskId: string | number) => void;
  onUnpublishTask?: (taskId: string | number) => void | Promise<void>;
  onPublishListingTask?: (taskId: string | number) => void | Promise<void>;
  onDeleteTask?: (taskId: string | number) => void | Promise<void>;
  /** 点击「编辑」：由外层关闭菜单并进入编辑流（TaskDetail 内组装 initialData） */
  onEditTask?: () => void;
}

export default function TaskHeader({
  taskId,
  isBookmarked,
  isMyTask,
  taskStatus,
  listStatus = 'published',
  onClose,
  onToggleBookmark,
  onUnpublishTask,
  onPublishListingTask,
  onDeleteTask,
  onEditTask,
}: TaskHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6 pt-8 bg-gradient-to-b from-black/50 to-transparent">
      <button 
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex space-x-3">
        <button 
          onClick={() => onToggleBookmark && onToggleBookmark(taskId)}
          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
            isBookmarked
              ? 'bg-rose-500/80 text-white hover:bg-rose-600/80'
              : 'bg-black/20 text-white hover:bg-black/40'
          }`}
        >
          <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
        <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-12 w-32 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-40 origin-top-right"
              >
                {isMyTask ? (
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEditTask?.();
                      }}
                      className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors border-b border-slate-50 dark:border-slate-700/50"
                    >
                      编辑
                    </button>
                    {taskStatus === 'pending' && listStatus === 'published' && onUnpublishTask && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          void onUnpublishTask(taskId);
                        }}
                        className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors border-b border-slate-50 dark:border-slate-700/50"
                      >
                        下架
                      </button>
                    )}
                    {taskStatus === 'pending' &&
                      (listStatus === 'draft' || listStatus === 'unpublished') &&
                      onPublishListingTask && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            void onPublishListingTask(taskId);
                          }}
                          className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors border-b border-slate-50 dark:border-slate-700/50"
                        >
                          {listStatus === 'draft' ? '发布任务' : '上架'}
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        void onDeleteTask?.(taskId);
                      }}
                      className="px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <button onClick={() => setShowMenu(false)} className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors">反馈</button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
