import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { RedeemVerifyPanel } from './RedeemInputModal';
import rewardCodesService from '@/api/service/rewardCodes';
import userItemsService from '@/api/service/userItems';
import { message } from '@/utils/pure/message';

export type MoreTab = 'verify' | 'redeem';

interface ItemMoreActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 打开「更多」时递增，用于重置核销输入框 */
  openNonce: number;
  onOpenScanner: () => void;
  /** 核销或兑换码兑换成功后刷新列表/用户信息 */
  onRedeemSuccess: () => Promise<void>;
}

export default function ItemMoreActionsModal({
  isOpen,
  onClose,
  openNonce,
  onOpenScanner,
  onRedeemSuccess,
}: ItemMoreActionsModalProps) {
  const [tab, setTab] = useState<MoreTab>('verify');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTab('verify');
      setRedeemCode('');
      setVerifyLoading(false);
    }
  }, [isOpen]);

  const handleRewardRedeem = async () => {
    const c = redeemCode.trim();
    if (!c || redeemLoading) return;
    setRedeemLoading(true);
    try {
      const res = await rewardCodesService.redeem(c);
      if (res.success) {
        const msg =
          typeof res.data === 'string' && res.data
            ? res.data
            : '兑换成功';
        message.success(msg);
        await onRedeemSuccess();
        onClose();
        setRedeemCode('');
      } else {
        message.error(res.msg || '兑换失败');
      }
    } catch (e) {
      console.error(e);
      message.error('兑换失败');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    const c = code.trim();
    if (!c || verifyLoading) return;
    setVerifyLoading(true);
    try {
      const res = await userItemsService.verifyByCode(c);
      if (res.success) {
        const msg =
          (typeof res.data === 'string' && res.data) ? res.data : res.msg || '核销成功';
        message.success(msg);
        await onRedeemSuccess();
        onClose();
      } else {
        message.error(res.msg || '核销失败');
      }
    } catch (e) {
      console.error(e);
      message.error('核销失败');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="更多">
      <div className="flex flex-col py-1">
        <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab('verify')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'verify'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            核销
          </button>
          <button
            type="button"
            onClick={() => setTab('redeem')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'redeem'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            兑换
          </button>
        </div>

        {tab === 'verify' && (
          <RedeemVerifyPanel
            panelKey={openNonce}
            onRedeem={handleVerifyCode}
            onScan={onOpenScanner}
            loading={verifyLoading}
          />
        )}

        {tab === 'redeem' && (
          <div className="flex flex-col">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              输入他人分享的兑换码，可领取积分、万能卡或道具（与奖励中心发布的码对应）。
            </p>
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="请输入兑换码"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 mb-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono tracking-wider"
            />
            <button
              type="button"
              onClick={handleRewardRedeem}
              disabled={!redeemCode.trim() || redeemLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-300/30 dark:shadow-indigo-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {redeemLoading ? '兑换中...' : '确认兑换'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
