import React from 'react';
import { motion } from 'motion/react';
import CheckinTab from './checkin/CheckinTab';
import PageHeader from './ui/PageHeader';

interface CheckinProps {
  onBack?: () => void;
}

/**
 * 我的签到页（签到者视角入口）
 */
export default function Checkin({ onBack }: CheckinProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900 h-full overflow-hidden"
    >
      <PageHeader title="我的签到" onBack={onBack} />

      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar">
        <CheckinTab />
      </div>
    </motion.div>
  );
}
