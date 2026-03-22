import React from 'react';
import { Copy, CheckCircle, QrCode } from 'lucide-react';
import * as Icons from 'lucide-react';
import Modal from '../ui/Modal';
import { UserItemRecord } from '@/api/service/userItems';

function isLikelyImageUrl(s?: string | null): boolean {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('//');
}

interface ItemRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: UserItemRecord | null;
}

export default function ItemRedemptionModal({ isOpen, onClose, item }: ItemRedemptionModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopy = () => {
    if (item.code) {
      navigator.clipboard.writeText(item.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const imgSrc = isLikelyImageUrl(item.icon) ? item.icon : undefined;
  const rawIcon = item.icon || 'Package';
  const pascalIcon = rawIcon.charAt(0).toUpperCase() + rawIcon.slice(1);
  const IconComponent =
    (Icons as any)[rawIcon] || (Icons as any)[pascalIcon] || Icons.Package;

  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
  }[item.color] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="道具核销">
      <div className="flex flex-col items-center pb-2">
        
        {/* Item Info Row */}
        <div className="flex items-center space-x-4 w-full bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
          <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${colorClasses}`}>
            {imgSrc ? (
              <img src={imgSrc} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <IconComponent className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{item.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-center text-xs mb-4 px-4">
          请向对方出示此二维码或兑换码进行核销
        </p>

        {/* QR Code Placeholder */}
        <div className="w-44 h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 mb-6 relative overflow-hidden">
          <QrCode className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-2" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">二维码加载中...</span>
          
          {/* Scanning animation line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        {/* Redemption Code */}
        <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="font-mono text-base font-bold text-slate-800 dark:text-white tracking-widest pl-2">
            {item.code || '暂无兑换码'}
          </span>
          
          <button
            onClick={handleCopy}
            disabled={!item.code}
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Modal>
  );
}
