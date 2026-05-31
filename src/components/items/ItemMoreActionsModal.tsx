import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { RedeemVerifyPanel } from './RedeemInputModal';
import userItemsService from '@/api/service/userItems';
import { message } from '@/utils/pure/message';
import RewardRedeemPanel from './RewardRedeemPanel';

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
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTab('verify');
      setVerifyLoading(false);
    }
  }, [isOpen]);

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
          <RewardRedeemPanel panelKey={openNonce} onRedeemSuccess={onRedeemSuccess} />
        )}
      </div>
    </Modal>
  );
}
