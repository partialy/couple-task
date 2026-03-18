import React from 'react';
import { motion } from 'motion/react';
import { AchievementCategory } from '../../data/achievements';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  key?: string;
  category: AchievementCategory;
  onClick: () => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const total = category.achievements.length;
  const completed = category.achievements.filter(a => a.isCompleted).length;
  const progress = Math.round((completed / total) * 100) || 0;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 text-left transition-all hover:shadow-md group"
    >
      <div className="relative h-32 w-full">
        <img 
          src={category.coverImage} 
          alt={category.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
          <div>
            <h4 className="text-white font-bold text-lg leading-tight">{category.title}</h4>
            <p className="text-white/70 text-xs mt-1 line-clamp-1">{category.description}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/30 flex items-center">
            <span className="text-white text-xs font-bold">{completed}/{total}</span>
          </div>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <span>完成进度</span>
            <span className="text-indigo-500">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </motion.button>
  );
}
