import React, { useState } from 'react';
import { ChevronLeft, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpecialItem } from './special/types';
import RedeemTab from './special/RedeemTab';
import PublishTab from './special/PublishTab';

interface SpecialRewardsProps {
  onBack?: () => void;
  specialItems: SpecialItem[];
  onRefresh: () => Promise<void>;
  key?: string;
}

export default function SpecialRewards({ onBack, specialItems, onRefresh }: SpecialRewardsProps) {
  const [activeTab, setActiveTab] = useState<'redeem' | 'publish'>('redeem');

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900 h-full overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-4 bg-white dark:bg-slate-800 shadow-sm relative z-20">
        <div className="flex items-center mb-6">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full relative z-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">特别奖励</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'redeem' 
                ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            特别兑换
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'publish' 
                ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            给 TA 发布
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'redeem' ? (
            <RedeemTab 
              key="special-redeem"
              specialItems={specialItems} 
            />
          ) : (
            <PublishTab 
              key="special-publish"
              specialItems={specialItems} 
              onRefresh={onRefresh}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
