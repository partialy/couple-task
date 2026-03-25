import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpecialItem } from './special/types';
import RedeemTab from './special/RedeemTab';
import PublishTab from './special/PublishTab';
import PageHeader from './ui/PageHeader';

interface SpecialRewardsProps {
  onBack?: () => void;
  /** 我给 TA 发布的（可编辑） */
  specialItemsSelf: SpecialItem[];
  /** 对方发给我的（可兑换） */
  specialItemsTarget: SpecialItem[];
  onRefreshSelf: () => Promise<void>;
  onRefreshTarget: () => Promise<void>;
  key?: string;
}

export default function SpecialRewards({
  onBack,
  specialItemsSelf,
  specialItemsTarget,
  onRefreshSelf,
  onRefreshTarget,
}: SpecialRewardsProps) {
  const [activeTab, setActiveTab] = useState<'redeem' | 'publish'>('redeem');


  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900 h-full overflow-hidden"
    >
      <PageHeader title="特别奖励" onBack={onBack} />

      {/* Tabs */}
      <div className="px-3 pb-3 bg-white/80 dark:bg-slate-900/80 relative z-20">
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

      <div className="flex-1 overflow-y-auto pb-2 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'redeem' ? (
            <RedeemTab 
              key="special-redeem"
              specialItems={specialItemsTarget} 
              onRefresh={onRefreshTarget}
            />
          ) : (
            <PublishTab 
              key="special-publish"
              specialItems={specialItemsSelf} 
              onRefresh={onRefreshSelf}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
