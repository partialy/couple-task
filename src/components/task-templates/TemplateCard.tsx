import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, User } from 'lucide-react';
import { TaskTemplate } from '../../data/taskTemplates';

interface TemplateCardProps {
  template: TaskTemplate;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={template.img}
          alt={template.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700">
            {template.category}
          </span>
          {template.source === 'official' ? (
            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/90 backdrop-blur-sm text-[10px] font-bold text-white border border-cyan-400/50 flex items-center">
              <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
              官方
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg bg-slate-500/90 backdrop-blur-sm text-[10px] font-bold text-white border border-slate-400/50 flex items-center">
              <User className="w-2.5 h-2.5 mr-0.5" />
              用户
            </span>
          )}
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{template.title}</h3>
          <div className="flex items-center text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-bold ml-0.5">{template.level}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {template.desc}
        </p>
        <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
          <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">{template.rewardType}奖励</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {template.taskType === 'one-time' ? '一次性' : 
             template.taskType === 'daily' ? '每天' : 
             template.taskType === 'weekly' ? '每周' : '每月'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default TemplateCard;
