import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import cardTransactionsService, {
  CardTransactionRecord,
} from '@/api/service/cardTransactions';

function formatCardTxDate(createdAt?: string | number): string {
  if (createdAt == null) return '';
  if (typeof createdAt === 'number') {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? String(createdAt) : d.toLocaleString('zh-CN');
  }
  const d = new Date(createdAt);
  return isNaN(d.getTime()) ? String(createdAt) : d.toLocaleString('zh-CN');
}

interface CardRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardRecordsModal({ isOpen, onClose }: CardRecordsModalProps) {
  const [cardRecords, setCardRecords] = useState<CardTransactionRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRecordsLoading(true);
    cardTransactionsService
      .page({ page: 1, size: 50 })
      .then((res) => {
        if (res.success && res.data?.records) {
          setCardRecords(res.data.records);
        } else {
          setCardRecords([]);
        }
      })
      .finally(() => setRecordsLoading(false));
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="获取记录">
      <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
        {recordsLoading ? (
          <div className="flex justify-center py-12 text-sm text-slate-400">
            加载中...
          </div>
        ) : cardRecords.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            暂无万能卡流水记录
          </p>
        ) : (
          cardRecords.map((record) => {
            const title =
              record.description?.trim() ||
              (record.transactionType
                ? `类型：${record.transactionType}`
                : '万能卡变动');
            const amt = record.amount;
            const amtStr = amt > 0 ? `+${amt}` : String(amt);
            const positive = amt > 0;
            return (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-700/30"
              >
                <div className="min-w-0 pr-2">
                  <p className="mb-1 break-words text-sm font-bold text-slate-800 dark:text-white">
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatCardTxDate(record.createdAt as string | number)}
                  </p>
                </div>
                <div
                  className={`flex-shrink-0 text-lg font-black ${positive ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {amtStr}
                </div>
              </div>
            );
          })
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-2xl bg-slate-100 py-3.5 font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
      >
        关闭
      </button>
    </Modal>
  );
}
