import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Sparkles } from 'lucide-react';
import { useCheckinStore } from '@/store/checkin';
import type { CheckinResult } from '@/api/service/checkin';
import { mapDayRewardFromApi, getRewardDisplayText } from './types';
import PlanCheckinCard from './PlanCheckinCard';

export default function CheckinTab() {
  const { targetPlans, fetchTargetPlans, performCheckin, isLoading } = useCheckinStore();
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchTargetPlans();
  }, [fetchTargetPlans]);

  const handleCheckin = async (planId: string) => {
    setCheckingIn(true);
    try {
      const result = await performCheckin(planId);
      if (result) {
        setCheckinResult(result);
        setTimeout(() => setCheckinResult(null), 3000);
      }
    } finally {
      setCheckingIn(false);
    }
  };

  if (targetPlans.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-20 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">暂无签到计划</p>
        <p className="text-slate-400 text-xs mt-1">等待 TA 为你配置签到计划</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 py-4 space-y-4"
    >
      {targetPlans.map((item) => (
        <PlanCheckinCard
          key={item.plan.id}
          item={item}
          onCheckin={handleCheckin}
          checkingIn={checkingIn}
        />
      ))}

      {/* 签到成功动画 */}
      <AnimatePresence>
        {checkinResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setCheckinResult(null)}
          >
            <motion.div
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 mx-8 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 10 }}
                className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">签到成功！</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                第 {checkinResult.dayNumber} 天 · 连续 {checkinResult.streak} 天
              </p>
              {checkinResult.rewards.length > 0 && (
                <div className="mt-3 space-y-1">
                  {checkinResult.rewards.map((r, i) => (
                    <p key={i} className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      +{getRewardDisplayText(mapDayRewardFromApi(r))}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
