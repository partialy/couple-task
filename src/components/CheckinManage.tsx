import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import ConfigTab from './checkin/ConfigTab';

interface CheckinManageProps {
  onBack?: () => void;
}

/**
 * 签到管理页（配置者视角入口，从「我的」页面进入）
 */
export default function CheckinManage({ onBack }: CheckinManageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900 h-full overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2 bg-white dark:bg-slate-800 shadow-sm shrink-0">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">签到管理</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar">
        <ConfigTab />
      </div>
    </motion.div>
  );
}
