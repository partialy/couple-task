import React from 'react';
import { Ticket, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface HowToGetCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToGetCardsModal({
  isOpen,
  onClose,
}: HowToGetCardsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="如何获取万能卡？">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-700/50 dark:bg-slate-700/50">
          <h4 className="mb-2 flex items-center text-base font-bold text-slate-800 dark:text-white">
            <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
            完成特殊任务
          </h4>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            完成带有“万能卡”标记的特殊任务，即可获得万能兑换卡。例如连续打卡、达成特定成就等。
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-700/50 dark:bg-slate-700/50">
          <h4 className="mb-2 flex items-center text-base font-bold text-slate-800 dark:text-white">
            <Ticket className="mr-2 h-5 w-5 text-indigo-500" />
            使用兑换码
          </h4>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            在特定节日或活动期间，家长可能会发放包含万能兑换卡的兑换码，输入即可领取。
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-2xl bg-indigo-500 py-3.5 font-bold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-600 dark:shadow-indigo-900/40"
      >
        我知道了
      </button>
    </Modal>
  );
}
