import type {
  CheckinPlanRecord,
  CheckinDayRewardRecord,
  CheckinRecordItem,
  CheckinStatusData,
  TimeWindow,
} from '@/api/service/checkin';

/** 前端签到计划（UI 层） */
export interface CheckinPlan {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  cycleType: 'weekly' | 'monthly';
  cycleDays: number;
  isConsecutive: boolean;
  timeWindows: TimeWindow[];
  status: 'active' | 'inactive';
  creatorId: string;
  targetUserId: string;
}

/** 前端每日奖励 */
export interface DayReward {
  id: string;
  planId: string;
  dayNumber: number;
  rewardType: 'points' | 'wild_card' | 'prop';
  rewardName?: string;
  rewardAmount: number;
  description?: string;
  icon?: string;
  color?: string;
}

/** 带奖励配置和状态的完整计划 */
export interface CheckinPlanFull {
  plan: CheckinPlan;
  dayRewards: DayReward[];
  status?: CheckinStatusData;
}

/** 从后端 record 转换为 UI 模型 */
export function mapPlanFromApi(record: CheckinPlanRecord): CheckinPlan {
  let timeWindows: TimeWindow[] = [];
  if (record.timeWindows) {
    try {
      timeWindows = typeof record.timeWindows === 'string'
        ? JSON.parse(record.timeWindows)
        : record.timeWindows;
    } catch { /* ignore */ }
  }
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    icon: record.icon ?? 'calendar-check',
    color: record.color ?? 'emerald',
    cycleType: record.cycleType,
    cycleDays: record.cycleDays,
    isConsecutive: record.isConsecutive === 1,
    timeWindows,
    status: record.status,
    creatorId: record.creatorId,
    targetUserId: record.targetUserId,
  };
}

export function mapDayRewardFromApi(record: CheckinDayRewardRecord): DayReward {
  return {
    id: record.id,
    planId: record.planId,
    dayNumber: record.dayNumber,
    rewardType: record.rewardType,
    rewardName: record.rewardName ?? undefined,
    rewardAmount: record.rewardAmount,
    description: record.description ?? undefined,
    icon: record.icon ?? undefined,
    color: record.color ?? undefined,
  };
}

/** 奖励类型中文标签 */
export const rewardTypeLabels: Record<string, string> = {
  points: '积分',
  wild_card: '万能卡',
  prop: '道具',
};

/** 获取奖励显示文案 */
export function getRewardDisplayText(reward: DayReward): string {
  if (reward.rewardType === 'points') {
    return `积分 ×${reward.rewardAmount}`;
  }
  if (reward.rewardType === 'wild_card') {
    return `万能卡 ×${reward.rewardAmount}`;
  }
  return reward.rewardName || `道具 ×${reward.rewardAmount}`;
}

export type { CheckinStatusData, CheckinRecordItem, TimeWindow };
