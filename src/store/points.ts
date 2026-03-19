import { create } from 'zustand';
import pointsService, { PointTransaction } from '@/api/service/points';
import message from '@/utils/message/message';
import { useUserStore } from './user';

interface PointsState {
  history: PointTransaction[];
  isLoading: boolean;
  fetchHistory: () => Promise<void>;
  redeemCode: (code: string) => Promise<boolean>;
  redeemItem: (itemId: string) => Promise<boolean>;
}

export const usePointsStore = create<PointsState>((set) => ({
  history: [],
  isLoading: false,

  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const res = await pointsService.getHistory();
      if (res.success) {
        set({ history: res.data });
      } else {
        message.error(res.msg || '获取积分记录失败');
      }
    } catch (error) {
      console.error('Failed to fetch points history:', error);
      message.error('获取积分记录失败');
    } finally {
      set({ isLoading: false });
    }
  },

  redeemCode: async (code: string) => {
    try {
      const res = await pointsService.redeemCode(code);
      if (res.success) {
        message.success('兑换成功');
        // Refresh user details to get updated points
        await useUserStore.getState().fetchUserDetail();
        // Refresh history
        await usePointsStore.getState().fetchHistory();
        return true;
      } else {
        message.error(res.msg || '兑换失败');
        return false;
      }
    } catch (error) {
      console.error('Failed to redeem code:', error);
      message.error('兑换失败');
      return false;
    }
  },

  redeemItem: async (itemId: string) => {
    try {
      const res = await pointsService.redeemItem(itemId);
      if (res.success) {
        message.success('兑换成功');
        // Refresh user details to get updated points
        await useUserStore.getState().fetchUserDetail();
        // Refresh history
        await usePointsStore.getState().fetchHistory();
        return true;
      } else {
        message.error(res.msg || '兑换失败');
        return false;
      }
    } catch (error) {
      console.error('Failed to redeem item:', error);
      message.error('兑换失败');
      return false;
    }
  }
}));
