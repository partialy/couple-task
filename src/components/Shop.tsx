import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShopItem } from './shop/types';
import RedeemTab from './shop/RedeemTab';
import PublishTab from './shop/PublishTab';
import PageHeader from './ui/PageHeader';

interface ShopProps {
  onBack?: () => void;
  onOpenPointsDetail?: () => void;
  redeemItems: ShopItem[];
  publishItems: ShopItem[];
  onRefreshShop: () => Promise<void>;
}

export default function Shop({
  onBack,
  onOpenPointsDetail,
  redeemItems,
  publishItems,
  onRefreshShop,
}: ShopProps) {
  const [activeTab, setActiveTab] = useState<'redeem' | 'publish'>('redeem');

  return (
    <motion.div 
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900 h-full overflow-hidden"
    >
      <PageHeader title="积分商城" onBack={onBack} />

      {/* Tabs */}
      <div className="px-3 pb-3 bg-white/80 dark:bg-slate-900/80 relative z-10">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'redeem' 
                ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            积分兑换
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'publish' 
                ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm' 
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
              key="shop-redeem"
              shopItems={redeemItems} 
              onOpenPointsDetail={onOpenPointsDetail}
              onRefreshShop={onRefreshShop}
            />
          ) : (
            <PublishTab 
              key="shop-publish"
              shopItems={publishItems} 
              onRefreshShop={onRefreshShop}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
