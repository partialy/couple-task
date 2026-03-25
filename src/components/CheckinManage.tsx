import React from 'react';
import { motion } from 'motion/react';
import ConfigTab from './checkin/ConfigTab';
import PageHeader from './ui/PageHeader';

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
      <PageHeader title="签到管理" onBack={onBack} />

      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar">
        <ConfigTab />
      </div>
    </motion.div>
  );
}
