import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { SpecialItem } from './types';
import { useUserStore } from '@/store/user';
import specialItemsService from '@/api/service/specialItems';
import { message } from '@/utils/pure/message';
import ConfirmModal from '@/components/ui/ConfirmModal';
import RedeemBalanceCard from './RedeemBalanceCard';
import RedeemSpecialItemRow from './RedeemSpecialItemRow';
import SpecialItemDetailModal from './SpecialItemDetailModal';
import CardRecordsModal from './CardRecordsModal';
import HowToGetCardsModal from './HowToGetCardsModal';

interface RedeemTabProps {
  specialItems: SpecialItem[];
  onRefresh: () => Promise<void>;
  key?: string;
}

export default function RedeemTab({ specialItems, onRefresh }: RedeemTabProps) {
  const { currentUser, fetchUserDetail } = useUserStore();
  const cardBalance = currentUser?.cards ?? 0;

  const activeItems = specialItems.filter((item) => item.status !== 'inactive');

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [pendingRedeemItem, setPendingRedeemItem] = useState<SpecialItem | null>(null);
  const [detailItem, setDetailItem] = useState<SpecialItem | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showHowToGetModal, setShowHowToGetModal] = useState(false);

  const requestRedeem = (item: SpecialItem) => {
    if (redeemingId || !currentUser?.id) return;
    if (cardBalance < item.cards) {
      message.error('万能卡不足');
      return;
    }
    const limited = item.stock != null && item.stock >= 0;
    if (limited && item.stock === 0) {
      message.error('库存不足');
      return;
    }
    setPendingRedeemItem(item);
  };

  const executeRedeem = async () => {
    const item = pendingRedeemItem;
    if (!item) return;
    setPendingRedeemItem(null);
    if (redeemingId || !currentUser?.id) return;
    setRedeemingId(item.id);
    try {
      const res = await specialItemsService.redeem(item.id);
      if (res.success && res.data) {
        const code = res.data.verifyCode;
        message.success(
          code != null && code !== ''
            ? `兑换成功！核销码：${code}`
            : `兑换成功！道具已放入「我的道具」`
        );
        await fetchUserDetail();
        await onRefresh();
      } else {
        message.error(res.msg || '兑换失败');
      }
    } catch (e) {
      console.error(e);
      message.error('兑换失败');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={pendingRedeemItem != null}
        title="确认兑换特别奖励"
        message={
          pendingRedeemItem
            ? `将消耗 ${pendingRedeemItem.cards} 张万能卡兑换「${pendingRedeemItem.name}」，兑换后道具将放入「我的道具」，是否继续？`
            : ''
        }
        confirmText="确认兑换"
        cancelText="取消"
        confirmColor="bg-indigo-500 hover:bg-indigo-600"
        onConfirm={executeRedeem}
        onCancel={() => setPendingRedeemItem(null)}
      />

      <SpecialItemDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
      />

      <CardRecordsModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
      />

      <HowToGetCardsModal
        isOpen={showHowToGetModal}
        onClose={() => setShowHowToGetModal(false)}
      />

      <motion.div
        key="special-redeem-tab"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="px-3 py-6"
      >
        <RedeemBalanceCard
          cardBalance={cardBalance}
          onOpenRecords={() => setShowRecordModal(true)}
          onOpenHowTo={() => setShowHowToGetModal(true)}
        />

        <h3 className="mb-4 px-1 text-lg font-bold text-slate-800 dark:text-white">
          特别奖励
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {activeItems.map((item) => (
            <RedeemSpecialItemRow
              key={item.id}
              item={item}
              cardBalance={cardBalance}
              redeemingId={redeemingId}
              onRequestRedeem={requestRedeem}
              onOpenDetail={setDetailItem}
            />
          ))}
          {activeItems.length === 0 && (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white py-12 text-center dark:border-slate-700 dark:bg-slate-800">
              <Star className="mx-auto mb-3 h-12 w-12 text-slate-200 dark:text-slate-700" />
              <p className="text-sm text-slate-400">暂无特殊奖励</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
