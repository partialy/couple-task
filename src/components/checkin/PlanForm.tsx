import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Delete, PaintBucket, RotateCcw, Save } from 'lucide-react';
import { motion } from 'motion/react';
import type { CheckinPlanPayload, DayRewardItem, TimeWindow } from '@/api/service/checkin';
import TimeWindowPicker from './TimeWindowPicker';
import DayRewardEditor from './DayRewardEditor';
import type { CheckinPlanFull } from './types';
import { message } from '@/utils/pure/message';

const DRAFT_KEY = 'checkin_plan_draft';

interface DraftData {
  name: string;
  description: string;
  cycleType: 'weekly' | 'monthly';
  isConsecutive: boolean;
  timeWindows: TimeWindow[];
  dayRewards: DayRewardItem[];
}

interface PlanFormProps {
  editPlan?: CheckinPlanFull;
  onSubmit: (payload: CheckinPlanPayload) => Promise<void>;
  onBack: () => void;
}

export default function PlanForm({ editPlan, onSubmit, onBack }: PlanFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cycleType, setCycleType] = useState<'weekly' | 'monthly'>('weekly');
  const [isConsecutive, setIsConsecutive] = useState(false);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
  const [dayRewards, setDayRewards] = useState<DayRewardItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const cycleDays = cycleType === 'weekly' ? 7 : 30;

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as DraftData;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (editPlan) {
      setName(editPlan.plan.name);
      setDescription(editPlan.plan.description || '');
      setCycleType(editPlan.plan.cycleType);
      setIsConsecutive(editPlan.plan.isConsecutive);
      setTimeWindows(editPlan.plan.timeWindows || []);
      setDayRewards(
        editPlan.dayRewards.map((r) => ({
          dayNumber: r.dayNumber,
          rewardType: r.rewardType,
          rewardName: r.rewardName,
          rewardAmount: r.rewardAmount,
          description: r.description,
          icon: r.icon,
          color: r.color,
        }))
      );
      return;
    }

    const draft = loadDraft();
    if (draft) {
      setName(draft.name);
      setDescription(draft.description);
      setCycleType(draft.cycleType);
      setIsConsecutive(draft.isConsecutive);
      setTimeWindows(draft.timeWindows || []);
      setDayRewards(draft.dayRewards || []);
      message.info('已恢复暂存草稿');
    }
  }, [editPlan, loadDraft]);

  const handleSaveDraft = () => {
    const draft: DraftData = { name, description, cycleType, isConsecutive, timeWindows, dayRewards };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    message.success('草稿已暂存');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        cycleType,
        isConsecutive: isConsecutive ? 1 : 0,
        timeWindows: timeWindows.length > 0 ? timeWindows : undefined,
        dayRewards: dayRewards.length > 0 ? dayRewards : undefined,
      });
      localStorage.removeItem(DRAFT_KEY);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setCycleType('weekly');
    setIsConsecutive(false);
    setTimeWindows([]);
    setDayRewards([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-4 bg-white dark:bg-slate-800 shadow-sm shrink-0">
        <div className="flex items-center">
          <button
            onClick={
              onBack
            }
            className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {editPlan ? '编辑签到计划' : '新建签到计划'}
          </h2>
          <button onClick={handleReset} className='text-red-500 text-sm font-bold bg-red-500/10 dark:bg-red-500/20 dark:text-red-500 py-1 px-2 rounded-lg flex flex-row items-center justify-center ml-auto gap-1 cursor-pointer'>
            <RotateCcw className='w-4 h-4' />重置
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24 no-scrollbar">
        {/* 名称 */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">计划名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：早起打卡"
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* 描述 */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="每天早起签到赢奖励"
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* 周期类型 */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">周期类型</label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setCycleType('weekly')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                cycleType === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              每周 7 天
            </button>
            <button
              onClick={() => setCycleType('monthly')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                cycleType === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              每月 30 天
            </button>
          </div>
        </div>

        {/* 连续签到 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-white">连续签到</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isConsecutive ? '断签一天回到第 1 天' : '漏签跳过，继续推进'}
            </p>
          </div>
          <button
            onClick={() => setIsConsecutive(!isConsecutive)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              isConsecutive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${
                isConsecutive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 时间窗口 */}
        <TimeWindowPicker value={timeWindows} onChange={setTimeWindows} />

        {/* 每日奖励 */}
        <DayRewardEditor cycleDays={cycleDays} value={dayRewards} onChange={setDayRewards} />
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-700">
        <div className="flex gap-3">
          {!editPlan && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Save className="w-4 h-4" />
              暂存
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
          >
            {submitting ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
