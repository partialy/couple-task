import React from 'react';
import { motion } from 'motion/react';
import { Gift, Heart, Star, Coffee, Plane, Music, ShoppingBag } from 'lucide-react';
import { UiTask } from '@/types/task';

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

export default function TaskCard({ task, onClick }: { task: UiTask, onClick?: () => void, key?: any }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`w-full rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-sm border overflow-hidden flex flex-col transition-colors cursor-pointer ${
        task.isPrivileged 
          ? 'border-amber-400 dark:border-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
          : 'border-white/40 dark:border-slate-700/50'
      }`}
    >
      <div className="w-full relative overflow-hidden">
        <img 
          src={task.img} 
          alt={task.title} 
          className={`w-full h-auto object-cover transition-all duration-500 min-h-48   ${task.isPrivate ? 'blur-xl scale-110' : ''}`} 
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* 标签显示在图片上方 */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <div className="flex flex-wrap gap-1.5">
            {task.category && (
              <span className="text-[10px] font-bold backdrop-blur-md text-white px-2 py-1 rounded-lg shadow-sm border bg-rose-500/80 border-rose-400/50">
                {task.category}
              </span>
            )}
            {task.taskType && task.taskType !== 'one-time' && (
              <span className="text-[10px] font-bold backdrop-blur-md text-white px-2 py-1 rounded-lg shadow-sm border bg-indigo-500/80 border-indigo-400/50">
                {task.taskType === 'daily' ? '每天' : task.taskType === 'weekly' ? '每周' : '每月'}
              </span>
            )}
          </div>
          {task.isBookmarked && (
            <div className="w-6 h-6 rounded-full bg-rose-500/80 backdrop-blur-md flex items-center justify-center shadow-sm border border-rose-400/50">
              <Heart className="w-3.5 h-3.5 text-white fill-current" />
            </div>
          )}
        </div>

        {/* 底部黑色渐变遮罩，带有模糊效果，越往上越白/透明 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/90 via-black/40 to-transparent backdrop-blur-md [mask:linear-gradient(to_top,black_20%,transparent_100%)] pointer-events-none"></div>

        {/* 作者信息胶囊 */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-start z-10">
          <div className={`flex items-center space-x-1.5 backdrop-blur-md border rounded-full p-1 pr-2.5 shadow-sm ${
            task.gender === 'female' 
              ? 'bg-pink-50/80 dark:bg-pink-950/80 border-pink-200/50 dark:border-pink-800/50' 
              : task.gender === 'male'
                ? 'bg-sky-50/80 dark:bg-sky-950/80 border-sky-200/50 dark:border-sky-800/50'
                : 'bg-rose-50/80 dark:bg-rose-950/80 border-rose-200/50 dark:border-rose-800/50'
          }`}>
            <img 
              src={task.authorAvatar || `https://picsum.photos/seed/${task.author || 'user'}/32/32`} 
              alt={task.authorName || "User"} 
              className={`w-4 h-4 rounded-full object-cover border ${
                task.gender === 'female'
                  ? 'border-pink-200 dark:border-pink-800'
                  : task.gender === 'male'
                    ? 'border-sky-200 dark:border-sky-800'
                    : 'border-rose-200 dark:border-rose-800'
              }`}
              referrerPolicy="no-referrer"
            />
            <span className={`text-[10px] font-medium line-clamp-1 ${
              task.gender === 'female'
                ? 'text-pink-800 dark:text-pink-200'
                : task.gender === 'male'
                  ? 'text-sky-800 dark:text-sky-200'
                  : 'text-rose-800 dark:text-rose-200'
            }`}>
              {task.authorName || "神秘发布者"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-3.5 flex flex-col flex-1">
        {/* 标题（最大1行） */}
        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-1 leading-tight transition-colors">
          {task.isPrivate ? '🔒 隐私任务' : task.title}
        </h3>
        
        {/* 描述（最大2行） */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed transition-colors">
          {task.isPrivate ? '••••••••••••••••••••' : task.desc}
        </p>
        
        {/* 任务奖励（只显示第一个） */}
        {task.rewards && task.rewards.length > 0 && (() => {
          const reward = task.rewards[0];
          const isObj = typeof reward === 'object';
          const text = isObj ? reward.content : reward;
          const color = isObj ? reward.color : 'amber';
          const iconName = isObj ? reward.icon : 'Gift';
          
          const IconComponent = icons[iconName] || Gift;
          const style = colorStyles[color] || colorStyles.amber;
          
          return (
            <div className={`mt-auto flex items-center space-x-1.5 bg-linear-to-r ${style.bg} ${style.text} px-2.5 py-1.5 rounded-xl w-fit border ${style.border} shadow-sm`}>
              <IconComponent className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold line-clamp-1">{task.isPrivate ? '***' : text}</span>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}
