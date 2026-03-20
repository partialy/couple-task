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
};

export default rewardCodesService;
