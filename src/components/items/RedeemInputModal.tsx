import React, { useEffect, useMemo, useState } from 'react';
import { ScanLine } from 'lucide-react';
import * as Icons from 'lucide-react';
import Modal from '../ui/Modal';
import userItemsService, { UserItemRecord } from '@/api/service/userItems';
import { getUserItemIconShellClass } from './userItemIconColor';
import { message } from '@/utils/pure/message';

interface RedeemVerifyPanelProps {
  onRedeem: (code: string) => void | Promise<void>;
  onScan: () => void;
  /** 变化时清空输入（例如每次打开「更多」菜单时递增） */
  panelKey?: number | string;
  /** 请求进行中：禁用输入与按钮 */
  loading?: boolean;
}

/** 道具核销：输入核销码或扫码（可嵌入其它弹窗） */
export function RedeemVerifyPanel({ onRedeem, onScan, panelKey, loading }: RedeemVerifyPanelProps) {
  const [code, setCode] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queriedItem, setQueriedItem] = useState<UserItemRecord | null>(null);
  const [confirmCountdown, setConfirmCountdown] = useState(0);

  useEffect(() => {
    setCode('');
    setQueriedItem(null);
    setConfirmCountdown(0);
  }, [panelKey]);

  useEffect(() => {
    if (confirmCountdown <= 0) return;
    const timer = window.setTimeout(() => {
      setConfirmCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [confirmCountdown]);

  useEffect(() => {
    setQueriedItem(null);
    setConfirmCountdown(0);
  }, [code]);

  const isLikelyImageUrl = (value?: string | null): boolean => {
    if (!value || typeof value !== 'string') return false;
    const t = value.trim();
    return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('//');
  };

  const handleAction = async () => {
    const c = code.trim();
    if (!c || loading || queryLoading) return;

    if (!queriedItem) {
      setQueryLoading(true);
      try {
        const res = await userItemsService.info(c);
        if (res.success && res.data) {
          setQueriedItem(res.data);
          setConfirmCountdown(3);
          message.info('请核对道具信息后确认核销');
        } else {
          message.error(res.msg || '查询失败');
          setQueriedItem(null);
          setConfirmCountdown(0);
        }
      } catch (e) {
        console.error(e);
        message.error('查询失败');
        setQueriedItem(null);
        setConfirmCountdown(0);
      } finally {
        setQueryLoading(false);
      }
      return;
    }

    if (confirmCountdown > 0) return;
    await onRedeem(c);
  };

  const cardIcon = useMemo(() => {
    const rawIcon = isLikelyImageUrl(queriedItem?.icon) ? 'Package' : queriedItem?.icon || 'Package';
    const pascalIcon = rawIcon.charAt(0).toUpperCase() + rawIcon.slice(1);
    return (Icons as any)[rawIcon] || (Icons as any)[pascalIcon] || Icons.Package;
  }, [queriedItem?.icon]);

  const cardImgSrc = isLikelyImageUrl(queriedItem?.icon) ? queriedItem?.icon : undefined;
  const colorClasses = getUserItemIconShellClass(queriedItem?.color);
  const isConfirmStage = !!queriedItem;
  const actionDisabled = !code.trim() || loading || queryLoading || (isConfirmStage && confirmCountdown > 0);
  const actionText = queryLoading
    ? '查询中...'
    : loading
      ? '核销中...'
      : isConfirmStage
        ? (confirmCountdown > 0 ? `确认核销（${confirmCountdown}s）` : '确认核销')
        : '查询';

  return (
    <div className="flex flex-col py-2">
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
        请输入对方提供的<strong className="text-slate-600 dark:text-slate-300">道具核销码</strong>
        ，或点击右侧按钮扫描核销二维码。
      </p>

      <div className="relative flex items-center mb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="请输入核销码"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-4 pr-12 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono tracking-wider"
        />
        <button
          type="button"
          onClick={onScan}
          className="absolute right-2 p-2 text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          aria-label="扫码核销"
        >
          <ScanLine className="w-5 h-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAction}
        disabled={actionDisabled}
        className={`w-full py-3.5 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed ${
          isConfirmStage
            ? 'bg-linear-to-r from-rose-500 to-red-600 shadow-rose-300/30 dark:shadow-rose-900/40'
            : 'bg-linear-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 shadow-cyan-300/40 dark:shadow-cyan-900/40'
        }`}
      >
        {actionText}
      </button>

      {queriedItem && (
        <div className="mt-4">
          <p className="text-rose-500 dark:text-rose-400 text-xs font-bold mb-2">
            请核对道具信息
          </p>
          <div className="flex items-center space-x-3 w-full bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className={`w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${colorClasses}`}>
              {cardImgSrc ? (
                <img src={cardImgSrc} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                React.createElement(cardIcon, { className: 'w-5 h-5' })
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{queriedItem.name || '未知道具'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {queriedItem.description || '暂无描述'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                核销码：{queriedItem.code}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RedeemInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => void;
  onScan: () => void;
}

export default function RedeemInputModal({ isOpen, onClose, onRedeem, onScan }: RedeemInputModalProps) {
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (isOpen) {
      setNonce((n) => n + 1);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="道具核销">
      <RedeemVerifyPanel onRedeem={onRedeem} onScan={onScan} panelKey={nonce} />
    </Modal>
  );
}
