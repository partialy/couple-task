import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift } from 'lucide-react';
import { ShopItem, iconMap, colorStyles } from './types';
import { usePointsStore } from '../../store/points';
import { useUserStore } from '../../store/user';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { message } from '@/utils/pure/message';

interface RedeemTabProps {
  shopItems: ShopItem[];
  onOpenPointsDetail?: () => void;
  onRefreshShop?: () => Promise<void>;
}

export default function RedeemTab({ shopItems, onOpenPointsDetail, onRefreshShop }: RedeemTabProps) {
  // Only show active items in the redeem tab
  const activeItems = shopItems.filter(item => item.status !== 'inactive');
  
  const { redeemItem } = usePointsStore();
  const { currentUser } = useUserStore();
  const [pendingShopItem, setPendingShopItem] = useState<ShopItem | null>(null);

  const requestShopRedeem = (item: ShopItem) => {
    const pts = currentUser?.points ?? 0;
    if (pts < item.points) {
      message.error('积分不足');
      return;
    }
    setPendingShopItem(item);
  };

  const confirmShopRedeem = async () => {
    const item = pendingShopItem;
    setPendingShopItem(null);
    if (item) {
      const ok = await redeemItem(String(item.id));
      if (ok) {
        await onRefreshShop?.();
      }
    }
  };

  return (
    <>
    <ConfirmModal
      isOpen={pendingShopItem != null}
      title="确认兑换"
      message={
        pendingShopItem
          ? `将消耗 ${pendingShopItem.points} 积分兑换「${pendingShopItem.name}」，是否继续？`
          : ''
      }
      confirmText="确认兑换"
      cancelText="取消"
      confirmColor="bg-amber-500 hover:bg-amber-600"
      onConfirm={confirmShopRedeem}
      onCancel={() => setPendingShopItem(null)}
    />
    <motion.div
      key="redeem-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-3 py-6"
    >
      {/* Points Card */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-300/40 dark:shadow-orange-900/40 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
        
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">当前可用积分</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black">{currentUser?.points || 0}</span>
            <span className="text-sm font-bold">分</span>
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            <button 
              onClick={onOpenPointsDetail}
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm outline-none focus:outline-none"
            >
              积分明细
            </button>
            <button 
              onClick={onOpenPointsDetail}
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm outline-none focus:outline-none"
            >
              兑换记录
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 px-1">热门兑换</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {activeItems.map(item => {
          const IconComponent = iconMap[item.icon] || Gift;
          const colorKey = Object.keys(colorStyles).find(k => colorStyles[k].bg === item.color) || 'pink';
          
          return (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm flex flex-col items-center text-center relative overflow-hidden group border border-slate-100 dark:border-slate-700/50">
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 overflow-hidden`}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <IconComponent className={`w-8 h-8 ${colorStyles[colorKey]?.text || 'text-pink-500'}`} />
                )}
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-1 text-sm">{item.name}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 h-6 leading-tight">{item.desc}</p>
              
              <div className="mt-auto w-full">
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <span className="text-lg font-black text-amber-500">{item.points}</span>
                  <span className="text-[10px] font-bold text-slate-400">积分</span>
                </div>
                <button 
                  type="button"
                  onClick={() => requestShopRedeem(item)}
                  className="w-full py-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 font-bold rounded-xl transition-colors text-xs focus:outline-none"
                >
                  立即兑换
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
    </>
  );
}
