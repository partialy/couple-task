import { create } from 'zustand';
import checkinService from '@/api/service/checkin';
import type { TargetPlanItem, PlanWithRewards, CheckinResult } from '@/api/service/checkin';
import { message } from '@/utils/pure/message';
import { useUserStore } from './user';

interface CheckinState {
  /** 我需要签到的计划列表 */
  targetPlans: TargetPlanItem[];
  /** 我发布的签到计划列表 */
  createdPlans: PlanWithRewards[];
  isLoading: boolean;

  /** 加载我需要签到的计划 */
  fetchTargetPlans: () => Promise<void>;
  /** 加载我发布的签到计划 */
  fetchCreatedPlans: () => Promise<void>;
  /** 执行签到 */
  performCheckin: (planId: string) => Promise<CheckinResult | null>;
}

export const useCheckinStore = create<CheckinState>((set) => ({
  targetPlans: [],
  createdPlans: [],
  isLoading: false,

  fetchTargetPlans: async () => {
    set({ isLoading: true });
    try {
      const res = await checkinService.listMyTargetPlans();
      if (res.success && res.data) {
        set({ targetPlans: res.data });
      } else {
        set({ targetPlans: [] });
      }
    } catch (error) {
      console.error('加载签到计划失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCreatedPlans: async () => {
    set({ isLoading: true });
    try {
      const res = await checkinService.listMyCreatedPlans();
      if (res.success && res.data) {
        set({ createdPlans: res.data });
      } else {
        set({ createdPlans: [] });
      }
    } catch (error) {
      console.error('加载签到计划失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  performCheckin: async (planId: string) => {
    try {
      const res = await checkinService.performCheckin(planId);
      if (res.success && res.data) {
        message.success('签到成功！');
        await useUserStore.getState().fetchUserDetail();
        await useCheckinStore.getState().fetchTargetPlans();
        return res.data;
      } else {
        message.error(res.msg || '签到失败');
        return null;
      }
    } catch (error) {
      console.error('签到失败:', error);
      message.error('签到失败');
      return null;
    }
  },
}));
