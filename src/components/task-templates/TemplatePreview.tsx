import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, User, Star, Gift, Calendar, Hash, Play } from 'lucide-react';
import { TaskTemplate } from '../../data/taskTemplates';

interface TemplatePreviewProps {
  template: TaskTemplate | null;
  onClose: () => void;
  onUse: (template: TaskTemplate) => void;
}

export default function TemplatePreview({ template, onClose, onUse }: TemplatePreviewProps) {
  if (!template) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header Image */}
        <div className="relative h-56 sm:h-64 flex-shrink-0">
          <img
            src={template.img}
            alt={template.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-white text-[10px] font-bold shadow-sm">
                {template.category}
              </span>
              {template.source === 'official' ? (
                <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-[10px] font-bold shadow-sm flex items-center border border-slate-100 dark:border-slate-700">
                  <ShieldCheck className="w-3 h-3 mr-1 text-cyan-500" />
                  官方模板
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-[10px] font-bold shadow-sm flex items-center border border-slate-100 dark:border-slate-700">
                  <User className="w-3 h-3 mr-1 text-slate-500" />
                  用户分享
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
              {template.title}
            </h2>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          <div className="space-y-6">
            {/* Description */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">任务描述</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {template.desc}
              </p>
            </section>
            
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center space-x-2 text-amber-500 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">任务等级</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{template.level}</span>
              </div>
              
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center space-x-2 text-indigo-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">任务频率</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {template.taskType === 'one-time' ? '一次性' : 
                   template.taskType === 'daily' ? '每日任务' : 
                   template.taskType === 'weekly' ? '每周任务' : '每月任务'}
                </span>
              </div>
            </div>
            
            {/* Rewards */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">预设奖励</h3>
              <div className="flex flex-wrap gap-2">
                {template.rewards.map((reward, idx) => (
                  <div key={idx} className="flex items-center space-x-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
                    <Gift className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{reward}</span>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Tags */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">推荐标签</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                    <Hash className="w-3 h-3" />
                    <span className="text-[11px] font-medium">{tag}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        
        {/* Footer Action */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={() => onUse(template)}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>使用此模板</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
