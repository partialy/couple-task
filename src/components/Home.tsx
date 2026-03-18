import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, MessageCircle, User, Plus, Compass, Clock, Lock, Gift, Star, Award, Zap } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';
import Profile from './Profile';
import InProgress from './InProgress';
import Messages from './Messages';
import LocationWeather from './LocationWeather';

// 瀑布流布局的模拟数据
// Moved to src/data/tasks.ts

const categories = ['全部', '旅行', '美食', '日常', '心愿单', '纪念日'];

interface HomeProps {
  key?: string;
  tasks: any[];
  setTasks: (tasks: any[]) => void;
  onPublish?: () => void;
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
  currentUser?: string | null;
  onLoginPrompt?: () => void;
  onOpenBindingPage?: () => void;
}

export default function Home({ 
  tasks, 
  setTasks, 
  onPublish, 
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
  onOpenBindingPage 
}: HomeProps) {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Handle back button for modal
  useEffect(() => {
    if (selectedTask) {
      // Push a dummy state so back button can be intercepted
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

  // 过滤任务 (只显示待接受的)
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const filteredTasks = pendingTasks
    .filter(task => activeCategory === '全部' || task.tags.includes(activeCategory))
    .sort((a, b) => {
      if (a.isPrivileged && !b.isPrivileged) return -1;
      if (!a.isPrivileged && b.isPrivileged) return 1;
      return 0;
    });

  // 将任务分成两列以实现瀑布流布局
  const leftColumn = filteredTasks.filter((_, index) => index % 2 === 0);
  const rightColumn = filteredTasks.filter((_, index) => index % 2 !== 0);

  const renderLoginPrompt = (pageName: string) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="w-24 h-24 mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
        <Lock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">尚未登录</h3>
      <p className="text-slate-400 dark:text-slate-500 text-center mb-8 text-sm">
        请先登录以查看{pageName}
      </p>
      <button
        onClick={onLoginPrompt}
        className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white rounded-full font-bold shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-105 active:scale-95 transition-all"
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
            {/* 头部与搜索 */}
            <div className="px-3 pt-3 pb-4 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h2 
                  className="text-2xl font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
                  onClick={onOpenBindingPage}
                >
                  任务广场
                </h2>
                <LocationWeather />
              </div>

              {/* 搜索框 */}
              <div className="flex space-x-2">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm"
                    placeholder="搜索你们的心愿任务..."
                  />
                </div>
                <button className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-2xl shadow-sm transition-colors flex-shrink-0">
                  搜索
                </button>
              </div>

              {/* 功能入口图标 */}
              <div className="grid grid-cols-4 gap-4 mt-6 px-1">
                {[
                  { icon: Gift, label: '礼物', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', onClick: onOpenShop },
                  { icon: Star, label: '任务', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', onClick: onOpenTemplates },
                  { icon: Award, label: '成就', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', onClick: onOpenAchievements },
                  { icon: Zap, label: '动态', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                ].map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={item.onClick}
                    className="flex flex-col items-center space-y-2 group"
                  >
                    <div className={`w-full aspect-square max-w-[56px] rounded-2xl ${item.bg} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 group-active:scale-95 transition-all duration-300`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 分类 */}
            <div className="w-full overflow-x-auto no-scrollbar py-4 z-10 flex-shrink-0">
              <div className="flex space-x-3 px-3 w-max">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 ${
                      activeCategory === cat
                        ? 'bg-cyan-400 dark:bg-cyan-500 text-white shadow-cyan-300/40 dark:shadow-cyan-900/40'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

              {/* 瀑布流列表 */}
            <div className="flex-1 overflow-y-auto px-3 pb-32 no-scrollbar z-10 relative">
              {!isLoggedIn ? renderLoginPrompt('任务广场') : filteredTasks.length > 0 ? (
                <div className="flex space-x-3 items-start w-full">
                  {/* 左列 */}
                  <div className="w-1/2 space-y-3">
                    {leftColumn.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                  </div>
                  {/* 右列 */}
                  <div className="w-1/2 space-y-3">
                    {rightColumn.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-3 pb-20">
                  <div className="w-48 h-48 mb-6 opacity-80">
                    {/* 空状态插画占位 */}
                    <img src="/icon.png" alt="空状态" className="object-cover" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">暂无任务</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-center mb-8 text-sm">
                    这里空空如也，去发布一个你们的心愿任务吧！
                  </p>
                  <button
                    onClick={onPublish}
                    className="px-8 py-3 bg-linear-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white rounded-full font-bold shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>立即发布</span>
                  </button>
                </div>
              )}
            </div>
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
            {!isLoggedIn ? renderLoginPrompt('个人主页') : (
              <Profile 
                onOpenShop={onOpenShop} 
                onOpenItems={onOpenItems}
                onOpenSpecialRewards={onOpenSpecialRewards}
                onOpenSettings={onOpenSettings} 
                onOpenPointsDetail={onOpenPointsDetail} 
                tasks={tasks} 
                setTasks={setTasks} 
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
            {!isLoggedIn ? renderLoginPrompt('任务进度') : (
              <InProgress tasks={tasks} setTasks={setTasks} currentUser={currentUser} />
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
            {!isLoggedIn ? renderLoginPrompt('消息列表') : (
              <Messages currentUser={currentUser || null} />
            )}
          </motion.div>
        )}
      </div>

      {/* 底部导航栏 (毛玻璃效果) */}
      <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl flex items-center justify-around px-3 pb-1 z-20 transition-colors shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <button 
          onClick={() => setActiveTab('square')}
          className={`p-2 flex flex-col items-center space-y-1 transition-colors ${activeTab === 'square' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Compass className="w-6 h-6" strokeWidth={activeTab === 'square' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">广场</span>
        </button>
        <button 
          onClick={() => setActiveTab('inprogress')}
          className={`p-2 flex flex-col items-center space-y-1 transition-colors ${activeTab === 'inprogress' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Clock className="w-6 h-6" strokeWidth={activeTab === 'inprogress' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">进行中</span>
        </button>
        
        {/* 中间悬浮按钮 */}
        <div className="relative -top-4">
          <button 
            onClick={isLoggedIn ? onPublish : onLoginPrompt}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 dark:from-pink-500 dark:to-rose-500 text-white shadow-lg shadow-pink-300/40 dark:shadow-pink-900/40 flex items-center justify-center hover:scale-105 transition-transform border-4 border-white/50 dark:border-slate-800/50 backdrop-blur-md"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        <button 
          onClick={() => setActiveTab('messages')}
          className={`p-2 flex flex-col items-center space-y-1 transition-colors ${activeTab === 'messages' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <MessageCircle className="w-6 h-6" strokeWidth={activeTab === 'messages' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">消息</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`p-2 flex flex-col items-center space-y-1 transition-colors ${activeTab === 'profile' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <User className="w-6 h-6" strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">我的</span>
        </button>
      </div>

      {/* 任务详情弹窗 */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetail 
            key="task-detail"
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
                  if (newStatus === 'in-progress') {
                    updatedTask.assignee = currentUser || '兔兔';
                  } else if (newStatus === 'pending') {
                    delete updatedTask.assignee;
                  }
                  return updatedTask;
                }
                return t;
              }));
              if (newStatus !== 'pending') {
                setSelectedTask(null); // 接受或放弃后关闭弹窗
              } else {
                setSelectedTask({ ...selectedTask, status: newStatus });
              }
            }}
            onToggleBookmark={(taskId) => {
              const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isBookmarked: !t.isBookmarked } : t);
              setTasks(updatedTasks);
              setSelectedTask(updatedTasks.find(t => t.id === taskId) || null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
