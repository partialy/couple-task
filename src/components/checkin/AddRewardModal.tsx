import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import NumberStepper from '@/components/ui/NumberStepper';
import type { DayRewardItem } from '@/api/service/checkin';

interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  onAdd: (reward: DayRewardItem) => void;
}

const TABS = [
  { value: 'points' as const, label: '积分' },
  { value: 'wild_card' as const, label: '万能卡' },
  { value: 'prop' as const, label: '道具' },
];

export default function AddRewardModal({
  isOpen,
  onClose,
  dayNumber,
  onAdd,
}: AddRewardModalProps) {
  const [tab, setTab] = useState<'points' | 'wild_card' | 'prop'>('points');
  const [amount, setAmount] = useState(1);
  const [propName, setPropName] = useState('');
  const [propDesc, setPropDesc] = useState('');

  const reset = () => {
    setTab('points');
    setAmount(1);
    setPropName('');
    setPropDesc('');
  };

  const handleAdd = () => {
    const item: DayRewardItem = {
      dayNumber,
      rewardType: tab,
      rewardAmount: amount,
    };
    if (tab === 'prop') {
      item.rewardName = propName || '道具';
      if (propDesc) item.description = propDesc;
    }
    onAdd(item);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canAdd = tab !== 'prop' || propName.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`添加第 ${dayNumber} 天奖励`}>
      <div className="space-y-5">
        {/* Tab 切换 */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                tab === t.value
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 道具名称/描述 */}
        {tab === 'prop' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                placeholder="道具名称"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                描述 <span className="text-slate-400 font-normal">(可选)</span>
              </label>
              <input
                type="text"
                value={propDesc}
                onChange={(e) => setPropDesc(e.target.value)}
                placeholder="道具描述"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* 数量 */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">数量</label>
          <NumberStepper value={amount} onChange={setAmount} min={1} />
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
          >
            添加
          </button>
        </div>
      </div>
    </Modal>
  );
}
