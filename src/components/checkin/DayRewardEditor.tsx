import React, { useState } from 'react';
import { Plus, X, Coins, CreditCard, Package, Wand2 } from 'lucide-react';
import type { DayRewardItem } from '@/api/service/checkin';
import BatchRewardModal from './BatchRewardModal';
import AddRewardModal from './AddRewardModal';

interface DayRewardEditorProps {
  cycleDays: number;
  value: DayRewardItem[];
  onChange: (rewards: DayRewardItem[]) => void;
}

const REWARD_ICON: Record<string, React.ReactNode> = {
  points: <Coins className="w-3 h-3 text-amber-400" />,
  wild_card: <CreditCard className="w-3 h-3 text-purple-400" />,
  prop: <Package className="w-3 h-3 text-blue-400" />,
};

const REWARD_LABEL: Record<string, string> = {
  points: '积分',
  wild_card: '万能卡',
  prop: '道具',
};

function getRewardTag(reward: DayRewardItem) {
  if (reward.rewardType === 'prop') {
    return `${reward.rewardName || '道具'} ×${reward.rewardAmount}`;
  }
  return `${REWARD_LABEL[reward.rewardType]} ×${reward.rewardAmount}`;
}

export default function DayRewardEditor({ cycleDays, value, onChange }: DayRewardEditorProps) {
  const [batchOpen, setBatchOpen] = useState(false);
  const [addDay, setAddDay] = useState<number | null>(null);

  const rewardsByDay = new Map<number, DayRewardItem[]>();
  value.forEach((r) => {
    const list = rewardsByDay.get(r.dayNumber) || [];
    list.push(r);
    rewardsByDay.set(r.dayNumber, list);
  });

  const removeReward = (dayNumber: number, index: number) => {
    const dayRewards = rewardsByDay.get(dayNumber) || [];
    const target = dayRewards[index];
    onChange(value.filter((r) => r !== target));
  };

  const handleBatchConfirm = (rewards: DayRewardItem[]) => {
    onChange(rewards);
  };

  const handleAddReward = (reward: DayRewardItem) => {
    onChange([...value, reward]);
  };

  return (
    <>
      <div className="space-y-3">
        {/* 标题行：左=标签，右=一键配置 */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">每日奖励配置</label>
          <button
            type="button"
            onClick={() => setBatchOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            一键配置
          </button>
        </div>

        {/* 每天列表 */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
          {Array.from({ length: cycleDays }, (_, i) => i + 1).map((day) => {
            const dayRewards = rewardsByDay.get(day) || [];
            return (
              <div key={day} className="bg-white border border-gray-100 dark:border-slate-700 shadow-sm dark:bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    第 {day} 天
                  </span>
                  <button
                    type="button"
                    onClick={() => setAddDay(day)}
                    className="text-xs text-emerald-500 hover:text-emerald-600 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    添加
                  </button>
                </div>
                {dayRewards.length === 0 && (
                  <p className="text-xs text-slate-400 italic">未配置奖励</p>
                )}
                {dayRewards.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dayRewards.map((reward, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-xs text-slate-700 dark:text-slate-200"
                      >
                        {REWARD_ICON[reward.rewardType]}
                        <span className="text-slate-700 dark:text-slate-200">{getRewardTag(reward)}</span>
                        <button
                          type="button"
                          onClick={() => removeReward(day, idx)}
                          className="ml-0.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 一键配置 Modal */}
      <BatchRewardModal
        isOpen={batchOpen}
        onClose={() => setBatchOpen(false)}
        cycleDays={cycleDays}
        onConfirm={handleBatchConfirm}
      />

      {/* 每天添加奖励 Modal */}
      <AddRewardModal
        isOpen={addDay !== null}
        onClose={() => setAddDay(null)}
        dayNumber={addDay ?? 1}
        onAdd={handleAddReward}
      />
    </>
  );
}
