import request from '../request';
import { ApiResponse, PageResponse } from '../types';

export interface RewardCodeRecord {
  id: string;
  code: string;
  rewardType: string;
  rewardName: string;
  rewardCount: number;
  icon?: string;
  color?: string;
  imageUrl?: string;
  description?: string | null;
  creatorId: string;
  status: string;
  redeemerId?: string | null;
  redeemedAt?: string | null;
  createdAt?: string;
}

export interface RewardCodePublishPayload {
  rewardName: string;
  rewardType: 'prop' | 'points' | 'wild_card';
  rewardCount: number;
  icon?: string;
  color?: string;
  imageUrl?: string;
  description?: string;
}

export interface RewardCodesPageQuery {
  page?: number;
  size?: number;
  rewardType?: string;
  status?: string;
}

export interface RewardRedeemResult {
  rewardType: string;
  rewardName: string;
  rewardCount: number;
  icon?: string;
  color?: string;
  imageUrl?: string;
  description?: string | null;
}

const rewardCodesService = {
  async publish(payload: RewardCodePublishPayload): Promise<ApiResponse<RewardCodeRecord>> {
    return await request.post('/reward-codes/publish', payload);
  },

  async page(query: RewardCodesPageQuery): Promise<ApiResponse<PageResponse<RewardCodeRecord>>> {
    return await request.get('/reward-codes/page', { params: query });
  },

  async voidCode(id: string): Promise<ApiResponse<string>> {
    return await request.post(`/reward-codes/void/${id}`);
  },

  async restore(id: string): Promise<ApiResponse<string>> {
    return await request.post(`/reward-codes/restore/${id}`);
  },

  /** 输入兑换码领取积分/万能卡/道具（与 POST /points/redeem-code 等价） */
  async redeem(code: string): Promise<ApiResponse<RewardRedeemResult>> {
    return await request.post('/reward-codes/redeem', { code: code.trim() });
  },
};

export default rewardCodesService;
