import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { UserItemRecord } from '@/api/service/userItems';
import { getUserItemIconShellClass } from './userItemIconColor';

interface ItemCardProps {
  key?: string | React.Key;
  item: UserItemRecord;
  onClick: (item: UserItemRecord) => void;
}

function isLikelyImageUrl(s?: string | null): boolean {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('//');
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const imgSrc = isLikelyImageUrl(item.icon) ? item.icon : undefined;

  const rawIcon = isLikelyImageUrl(item.icon) ? 'Package' : item.icon || 'Package';
  const pascalIcon = rawIcon.charAt(0).toUpperCase() + rawIcon.slice(1);
  const IconComponent =
    (Icons as any)[rawIcon] || (Icons as any)[pascalIcon] || Icons.Package;

  const colorClasses = getUserItemIconShellClass(item.color);

  const isUsed = item.status === 'used';
  const isSpecialReward = item.isSpecial === 1;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className={`relative w-full overflow-hidden bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex items-center justify-between text-left border ${
        isUsed ? 'border-slate-200 dark:border-slate-700 opacity-60' : 'border-transparent'
      }`}
    >
      {isSpecialReward && (
        <div
          className="pointer-events-none absolute -left-8 top-3 z-10 w-28 origin-center -rotate-45 bg-violet-200/90 py-0.5 text-center text-[10px] font-black tracking-wider text-violet-900 shadow-sm dark:bg-violet-900/50 dark:text-violet-100"
          aria-hidden
        >
          SVIP
        </div>
      )}
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ${isUsed ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : colorClasses}`}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              className={`w-full h-full object-cover ${isUsed ? 'opacity-50 grayscale' : ''}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <IconComponent className="w-6 h-6" />
          )}
        </div>
        <div>
          <h4 className={`font-bold ${isUsed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
            {item.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {item.description}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end shrink-0 pl-2">
        {isUsed ? (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
            已使用
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold rounded-full">
            可使用
          </span>
        )}
      </div>
    </motion.button>
  );
}
