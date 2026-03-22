import React, { useEffect, useState } from 'react';
import { Copy, CheckCircle, QrCode } from 'lucide-react';
import * as Icons from 'lucide-react';
import QRCode from 'qrcode';
import Modal from '../ui/Modal';
import { UserItemRecord } from '@/api/service/userItems';
import { getUserItemIconShellClass } from './userItemIconColor';

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
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    if (!isOpen || !item?.code?.trim()) {
      setQrDataUrl(null);
      setQrError(false);
      setQrLoading(false);
      return;
    }
    let cancelled = false;
    setQrLoading(true);
    setQrError(false);
    setQrDataUrl(null);
    const code = item.code.trim();
    QRCode.toDataURL(code, {
      width: 176,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => {
        if (cancelled) return;
        setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrError(true);
      })
      .finally(() => {
        if (!cancelled) setQrLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, item?.code]);

  if (!item) return null;

  const handleCopy = () => {
    if (item.code) {
      navigator.clipboard.writeText(item.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const imgSrc = isLikelyImageUrl(item.icon) ? item.icon : undefined;
  const rawIcon = isLikelyImageUrl(item.icon) ? 'Package' : item.icon || 'Package';
  const pascalIcon = rawIcon.charAt(0).toUpperCase() + rawIcon.slice(1);
  const IconComponent =
    (Icons as any)[rawIcon] || (Icons as any)[pascalIcon] || Icons.Package;

  const colorClasses = getUserItemIconShellClass(item.color);

  const hasCode = !!item.code?.trim();
  /** 无核销码时不展示二维码加载态；有码时请求中或尚未拿到结果显示加载 */
  const showQrLoading = hasCode && (qrLoading || (!qrDataUrl && !qrError));

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

        {/* 前端根据核销码生成二维码，与扫码核销一致 */}
        <div className="w-44 h-44 bg-white dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 mb-6 relative overflow-hidden shrink-0">
          {!hasCode && (
            <div className="px-3 text-center">
              <QrCode className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">暂无核销码，无法生成二维码</span>
            </div>
          )}
          {hasCode && showQrLoading && (
            <>
              <QrCode className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-2 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">二维码加载中...</span>
            </>
          )}
          {hasCode && !showQrLoading && qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="核销二维码"
              className="w-full h-full object-contain p-2"
            />
          )}
          {hasCode && !showQrLoading && qrError && (
            <div className="px-3 text-center">
              <QrCode className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">二维码生成失败，请使用下方核销码</span>
            </div>
          )}
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
