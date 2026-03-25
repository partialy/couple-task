import request from '../request';
import { ApiResponse } from '../types';

/** 时间窗口 */
export interface TimeWindow {
  start: string;
  end: string;
}

/** 每日奖励配置项 */
export interface DayRewardItem {
  dayNumber: number;
  rewardType: 'points' | 'wild_card' | 'prop';
  rewardName?: string;
  rewardAmount: number;
  description?: string;
  icon?: string;
  color?: string;
}

/** 后端签到计划记录 */
export interface CheckinPlanRecord {
  id: string;
  belongBindingId: string;
  creatorId: string;
  targetUserId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  cycleType: 'weekly' | 'monthly';
  cycleDays: number;
  isConsecutive: number;
  timeWindows?: string | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/** 后端每日奖励记录 */
export interface CheckinDayRewardRecord {
  id: string;
  planId: string;
  dayNumber: number;
  rewardType: 'points' | 'wild_card' | 'prop';
  rewardName?: string | null;
  rewardAmount: number;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
}

/** 后端签到记录 */
export interface CheckinRecordItem {
  id: number;
  planId: string;
  userId: string;
  checkinDate: string;
  dayNumber: number;
  cycleNumber: number;
  streakCount: number;
  checkinAt: string;
}

/** 计划详情（含奖励） */
export interface PlanWithRewards {
  plan: CheckinPlanRecord;
  dayRewards: CheckinDayRewardRecord[];
}

/** 签到者计划列表项（含状态） */
export interface TargetPlanItem extends PlanWithRewards {
  status: CheckinStatusData;
}

/** 签到状态数据 */
export interface CheckinStatusData {
  checkedInToday: boolean;
  todayRecord: CheckinRecordItem | null;
  currentDayNumber: number;
  currentStreak: number;
  todayRewards: CheckinDayRewardRecord[];
  isInTimeWindow: boolean;
}

/** 签到结果 */
export interface CheckinResult {
  record: CheckinRecordItem;
  rewards: CheckinDayRewardRecord[];
  dayNumber: number;
  streak: number;
  cycle: number;
}

/** 日历数据 */
export interface CalendarData {
  records: CheckinRecordItem[];
  year: number;
  month: number;
}

/** 创建/更新计划请求体 */
export interface CheckinPlanPayload {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  cycleType: 'weekly' | 'monthly';
  isConsecutive: number;
  timeWindows?: TimeWindow[];
  dayRewards?: DayRewardItem[];
}

const checkinService = {
  /** 创建签到计划 */
  async createPlan(payload: CheckinPlanPayload): Promise<ApiResponse<PlanWithRewards>> {
    return await request.post('/checkin/plans', payload);
  },

  /** 更新签到计划 */
  async updatePlan(id: string, payload: Partial<CheckinPlanPayload>): Promise<ApiResponse<PlanWithRewards>> {
    return await request.put(`/checkin/plans/${id}`, payload);
  },

  /** 获取我相关的所有签到计划 */
  async listPlans(): Promise<ApiResponse<CheckinPlanRecord[]>> {
    return await request.get('/checkin/plans');
  },

  /** 获取我发布的签到计划（配置者视角） */
  async listMyCreatedPlans(): Promise<ApiResponse<PlanWithRewards[]>> {
    return await request.get('/checkin/plans/my-created');
  },

  /** 获取我需要签到的计划（签到者视角） */
  async listMyTargetPlans(): Promise<ApiResponse<TargetPlanItem[]>> {
    return await request.get('/checkin/plans/my-target');
  },

  /** 获取计划详情 */
  async getPlanDetail(id: string): Promise<ApiResponse<PlanWithRewards>> {
    return await request.get(`/checkin/plans/${id}`);
  },

  /** 删除签到计划 */
  async deletePlan(id: string): Promise<ApiResponse<unknown>> {
    return await request.delete(`/checkin/plans/${id}`);
  },

  /** 启用/停用签到计划 */
  async updatePlanStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<CheckinPlanRecord>> {
    return await request.put(`/checkin/plans/${id}/status`, { status });
  },

  /** 执行签到 */
  async performCheckin(planId: string): Promise<ApiResponse<CheckinResult>> {
    return await request.post(`/checkin/${planId}`);
  },

  /** 获取签到状态 */
  async getCheckinStatus(planId: string): Promise<ApiResponse<CheckinStatusData>> {
    return await request.get(`/checkin/${planId}/status`);
  },

  /** 获取签到日历数据 */
  async getCheckinCalendar(planId: string, year?: number, month?: number): Promise<ApiResponse<CalendarData>> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    const qs = params.toString();
    return await request.get(`/checkin/${planId}/calendar${qs ? `?${qs}` : ''}`);
  },
};

export default checkinService;
