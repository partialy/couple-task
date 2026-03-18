import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import PublishTab from './PublishTab';
import RecordTab from './RecordTab';

interface RewardCenterProps {
  onBack: () => void;
}

export default function RewardCenter({ onBack }: RewardCenterProps) {
  const [activeTab, setActiveTab] = useState<'publish' | 'record'>('publish');

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 pt-3 bg-white dark:bg-slate-800 shadow-sm z-10">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">发布中心</h2>
        <div className="w-10 h-10"></div> {/* Placeholder for balance */}
      </div>

      <div className="flex p-2 bg-white dark:bg-slate-800 shadow-sm z-10">
        <button
          onClick={() => setActiveTab('publish')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
            activeTab === 'publish' 
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          发布
        </button>
        <button
          onClick={() => setActiveTab('record')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
            activeTab === 'record' 
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          记录
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === 'publish' ? <PublishTab /> : <RecordTab />}
      </div>
    </motion.div>
  );
}
