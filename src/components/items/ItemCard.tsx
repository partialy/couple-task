import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { UserItemRecord } from '@/api/service/userItems';

interface ItemCardProps {
  key?: string | React.Key;
  item: UserItemRecord;
  onClick: (item: UserItemRecord) => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[item.icon] || Icons.Package;

  // Determine color classes based on item.color
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
  }[item.color] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-500';

  const isUsed = item.status === 'used';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className={`w-full bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex items-center justify-between text-left border ${
        isUsed ? 'border-slate-200 dark:border-slate-700 opacity-60' : 'border-transparent'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isUsed ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : colorClasses}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <h4 className={`font-bold ${isUsed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
            {item.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {item.description}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end shrink-0 pl-2">
        {isUsed ? (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
            已使用
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold rounded-full">
            可使用
          </span>
        )}
      </div>
    </motion.button>
  );
}
