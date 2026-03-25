import React, { useState, useEffect } from 'react';
import { Plus, Settings2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import checkinService from '@/api/service/checkin';
import type { CheckinPlanPayload, PlanWithRewards } from '@/api/service/checkin';
import { useCheckinStore } from '@/store/checkin';
import { message } from '@/utils/pure/message';
import { mapPlanFromApi, mapDayRewardFromApi, getRewardDisplayText } from './types';
import type { CheckinPlanFull } from './types';
import PlanForm from './PlanForm';
import ConfirmModal from '../ui/ConfirmModal';

/**
 * 签到管理 - 配置者视角（给 TA 配置签到）
 */
export default function ConfigTab() {
  const { createdPlans, fetchCreatedPlans } = useCheckinStore();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CheckinPlanFull | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCreatedPlans();
  }, [fetchCreatedPlans]);

  const handleCreate = async (payload: CheckinPlanPayload) => {
    const res = await checkinService.createPlan(payload);
    if (res.success) {
      message.success('签到计划创建成功');
      setShowForm(false);
      await fetchCreatedPlans();
    } else {
      message.error(res.msg || '创建失败');
    }
  };

  const handleUpdate = async (payload: CheckinPlanPayload) => {
    if (!editingPlan) return;
    const res = await checkinService.updatePlan(editingPlan.plan.id, payload);
    if (res.success) {
      message.success('签到计划已更新');
      setEditingPlan(null);
      await fetchCreatedPlans();
    } else {
      message.error(res.msg || '更新失败');
    }
  };

  const handleToggleStatus = async (plan: PlanWithRewards) => {
    const newStatus = plan.plan.status === 'active' ? 'inactive' : 'active';
    const res = await checkinService.updatePlanStatus(plan.plan.id, newStatus as any);
    if (res.success) {
      message.success(newStatus === 'active' ? '已启用' : '已停用');
      await fetchCreatedPlans();
    } else {
      message.error(res.msg || '操作失败');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await checkinService.deletePlan(deletingId);
    if (res.success) {
      message.success('已删除');
      setDeletingId(null);
      await fetchCreatedPlans();
    } else {
      message.error(res.msg || '删除失败');
    }
  };

  const toFullPlan = (item: PlanWithRewards): CheckinPlanFull => ({
    plan: mapPlanFromApi(item.plan),
    dayRewards: item.dayRewards.map(mapDayRewardFromApi),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 py-4"
    >
      {/* 新建按钮 */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors mb-4"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-bold">新建签到计划</span>
      </button>

      {/* 计划列表 */}
      {createdPlans.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-sm">暂无签到计划</p>
          <p className="text-slate-400 text-xs mt-1">点击上方按钮为 TA 创建一个签到计划吧</p>
        </div>
      )}

      <div className="space-y-3">
        {createdPlans.map((item) => {
          const plan = item.plan;
          const isActive = plan.status === 'active';
          const firstRewards = item.dayRewards.filter((r) => r.dayNumber <= 3);

          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border transition-colors ${
                isActive
                  ? 'border-emerald-100 dark:border-emerald-900/30'
                  : 'border-slate-100 dark:border-slate-700 opacity-70'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {isActive ? '启用' : '停用'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingPlan(toFullPlan(item))}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setDeletingId(plan.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {plan.cycleType === 'weekly' ? '每周' : '每月'} · {plan.isConsecutive === 1 ? '连续' : '非连续'}
                {plan.timeWindows && (() => {
                  try {
                    const windows = typeof plan.timeWindows === 'string' ? JSON.parse(plan.timeWindows as string) : plan.timeWindows;
                    if (Array.isArray(windows) && windows.length > 0) {
                      return ' · ' + windows.map((w: any) => `${w.start}-${w.end}`).join(', ');
                    }
                  } catch {}
                  return '';
                })()}
              </p>

              {/* Reward preview */}
              {firstRewards.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {firstRewards.map((r, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg"
                    >
                      Day{r.dayNumber}: {mapDayRewardFromApi(r).rewardType === 'prop'
                        ? (r.rewardName || '道具')
                        : `${r.rewardType === 'points' ? '积分' : '万能卡'}×${r.rewardAmount}`
                      }
                    </span>
                  ))}
                  {item.dayRewards.length > 3 && (
                    <span className="text-xs text-slate-400">...</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 创建表单 overlay */}
      <AnimatePresence>
        {showForm && (
          <PlanForm onSubmit={handleCreate} onBack={() => setShowForm(false)} />
        )}
        {editingPlan && (
          <PlanForm
            editPlan={editingPlan}
            onSubmit={handleUpdate}
            onBack={() => setEditingPlan(null)}
          />
        )}
      </AnimatePresence>

      {/* 删除确认 */}
      {deletingId && (
        <ConfirmModal
          title="删除签到计划"
          message="确定删除该签到计划吗？删除后不可恢复。"
          confirmText="删除"
          confirmColor="red"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </motion.div>
  );
}
