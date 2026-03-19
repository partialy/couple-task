import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopFabProps {
  visible: boolean;
  onClick: () => void;
}

/**
 * 回到顶部浮动按钮（右下角，避开底部导航）
 */
export default function ScrollToTopFab({ visible, onClick }: ScrollToTopFabProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          onClick={onClick}
          className="fixed right-4 bottom-[88px] z-40 w-11 h-11 rounded-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-center text-slate-700 dark:text-slate-100 hover:scale-105 active:scale-95 transition-transform"
          aria-label="返回顶部"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

