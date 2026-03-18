import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, HelpCircle, X } from 'lucide-react';

interface PointsDetailProps {
  onBack: () => void;
  key?: string;
}

export default function PointsDetail({ onBack }: PointsDetailProps) {
  const [pointsTab, setPointsTab] = useState<'income' | 'expense'>('income');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');

  const incomeList = [
    { id: 1, title: '完成任务：做一顿晚餐', points: '+50', date: '2026-03-07 18:30' },
    { id: 2, title: '完成任务：看周杰伦演唱会', points: '+200', date: '2026-03-05 21:00' },
    { id: 3, title: '注册奖励', points: '+1000', date: '2026-03-01 10:00' },
  ];
  const expenseList = [
    { id: 1, title: '兑换：特权卡', points: '-200', date: '2026-03-06 14:20' },
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
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
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">我的积分</h2>
        <button 
          onClick={() => setShowRulesModal(true)}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {/* Points Header */}
        <div className="bg-white dark:bg-slate-800 px-3 py-8 rounded-b-[40px] shadow-sm flex flex-col items-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">当前可用积分</p>
          <div className="text-5xl font-black text-amber-500 mb-6">1250</div>
          <button 
            onClick={() => setShowRedeemModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-300/40 dark:shadow-orange-900/40 hover:scale-105 active:scale-95 transition-all outline-none focus:outline-none"
          >
            兑换积分
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-3 mt-6 space-x-6 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setPointsTab('income')} 
            className={`pb-3 text-base font-bold transition-colors relative ${
              pointsTab === 'income' 
                ? 'text-amber-500' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            收入
            {pointsTab === 'income' && (
              <motion.div 
                layoutId="pointsTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full"
              />
            )}
          </button>
          <button 
            onClick={() => setPointsTab('expense')} 
            className={`pb-3 text-base font-bold transition-colors relative ${
              pointsTab === 'expense' 
                ? 'text-amber-500' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            支出
            {pointsTab === 'expense' && (
              <motion.div 
                layoutId="pointsTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full"
              />
            )}
          </button>
        </div>

        {/* List */}
        <div className="px-3 mt-4 space-y-3">
          {(pointsTab === 'income' ? incomeList : expenseList).map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.date}</p>
              </div>
              <div className={`font-black text-lg ${pointsTab === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                {item.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Modal */}
      <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowRedeemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">兑换积分</h3>
                <button 
                  onClick={() => setShowRedeemModal(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">请输入兑换码获取积分</p>
              <input 
                type="text" 
                value={redeemCode}
                onChange={e => setRedeemCode(e.target.value)}
                placeholder="请输入兑换码"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 dark:text-white mb-6"
              />
              <button 
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemCode('');
                }}
                disabled={!redeemCode.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-300/40 dark:shadow-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all outline-none focus:outline-none"
              >
                确认兑换
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowRulesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">积分规则</h3>
                <button 
                  onClick={() => setShowRulesModal(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>1. 完成对方发布的任务可获得相应积分。</p>
                <p>2. 积分可用于在积分商城兑换道具或礼物。</p>
                <p>3. 兑换码可通过特殊活动或对方赠送获得。</p>
                <p>4. 积分不可转让，不可提现。</p>
              </div>
              <button 
                onClick={() => setShowRulesModal(false)}
                className="w-full mt-8 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors outline-none focus:outline-none"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
