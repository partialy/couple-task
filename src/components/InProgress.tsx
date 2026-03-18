import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';

export default function InProgress({ tasks, setTasks, currentUser }: { tasks: any[], setTasks: (tasks: any[]) => void, currentUser?: string | null }) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>('in-progress');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Handle back button for modal
  React.useEffect(() => {
    if (selectedTask) {
      window.history.pushState({ modal: 'taskDetail' }, '', '#taskDetail');
      
      const handlePopState = () => {
        setSelectedTask(null);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [selectedTask]);

  const handleCloseTaskDetail = () => {
    if (selectedTask) {
      window.history.back();
    }
  };

  const handleQuickComplete = (taskId: number) => {
    setCompletingId(taskId);
    // Delay to show animation
    setTimeout(() => {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      setCompletingId(null);
    }, 600);
  };

  // Filter tasks based on status
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const displayTasks = activeTab === 'in-progress' ? inProgressTasks : completedTasks;

  // Generate week dates (7 days centered around today)
  const today = new Date();
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-32 no-scrollbar bg-slate-50 dark:bg-slate-900 h-full">
      {/* Header & Stats */}
      <div className="px-3 pt-3 pb-6 bg-white dark:bg-slate-800 rounded-b-[40px] shadow-sm relative z-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">任务进度</h2>
        
        <div className="flex space-x-4">
          <div className="flex-1 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/20">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <div className="text-amber-600 dark:text-amber-400 text-sm font-medium">正在进行</div>
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{inProgressTasks.length}</div>
          </div>
          <div className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">已完成</div>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{completedTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm">
          {weekDates.map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(date)} 
                className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-110' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-[10px] font-medium mb-1">{dayName}</span>
                <span className="text-sm font-bold">{date.getDate()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 mt-8 space-x-6 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('in-progress')} 
          className={`pb-3 text-base font-bold transition-colors relative ${
            activeTab === 'in-progress' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          进行中
          {activeTab === 'in-progress' && (
            <motion.div 
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full"
            />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={`pb-3 text-base font-bold transition-colors relative ${
            activeTab === 'completed' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          已完成
          {activeTab === 'completed' && (
            <motion.div 
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full"
            />
          )}
        </button>
      </div>

      {/* Timeline & Task List */}
      <div className="px-4 mt-6 pb-8">
        {displayTasks.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
            <AnimatePresence mode="popLayout">
              {displayTasks.map((task, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.05 
                  }}
                  key={task.id} 
                  className="relative pl-6"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-900 ${
                    activeTab === 'in-progress' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  
                  {/* Time Label */}
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {task.date || 'INFINITE'}
                  </div>
                  
                  {/* Task Card */}
                  <div className="relative">
                    <TaskCard task={task} onClick={() => setSelectedTask(task)} />
                    
                    {/* Status Badge Overlay */}
                    {activeTab === 'in-progress' && (
                      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickComplete(task.id);
                          }}
                          className="group relative w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                            completingId === task.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-500'
                          }`} />
                          
                          <AnimatePresence>
                            {completingId === task.id && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 1 }}
                                exit={{ scale: 2, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                className="absolute inset-0 flex items-center justify-center text-emerald-500 pointer-events-none"
                              >
                                <CheckCircle className="w-6 h-6 fill-white dark:fill-slate-900" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>

                        <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm border border-amber-400/50">
                          <Clock className="w-3 h-3" />
                          <span>进行中</span>
                        </span>
                      </div>
                    )}
                    
                    {activeTab === 'completed' && (
                      <div className="absolute top-3 right-3 z-10 pointer-events-none">
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                        >
                          <span className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm border border-emerald-400/50">
                            <CheckCircle className="w-3 h-3" />
                            <span>已完成</span>
                          </span>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 mb-4 opacity-50 text-slate-300 dark:text-slate-700">
              <CheckCircle className="w-full h-full" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-bold">暂无{activeTab === 'in-progress' ? '进行中' : '已完成'}的任务</p>
          </motion.div>
        )}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetail 
            task={selectedTask} 
            onClose={handleCloseTaskDetail} 
            currentUser={currentUser}
            onDeleteTask={(taskId) => {
              setTasks(tasks.filter(t => t.id !== taskId));
              handleCloseTaskDetail();
            }}
            onUnpublishTask={(taskId) => {
              setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'unpublished' } : t));
              handleCloseTaskDetail();
            }}
            onUpdateTask={(taskId, newStatus) => {
              setTasks(tasks.map(t => {
                if (t.id === taskId) {
                  const updatedTask = { ...t, status: newStatus };
                  if (newStatus === 'pending') {
                    delete updatedTask.assignee;
                  }
                  return updatedTask;
                }
                return t;
              }));
              handleCloseTaskDetail(); // 关闭弹窗
            }}
            onToggleBookmark={(taskId) => {
              const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isBookmarked: !t.isBookmarked } : t);
              setTasks(updatedTasks);
              setSelectedTask(updatedTasks.find(t => t.id === taskId) || null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
