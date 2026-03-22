import request from '../request';
import { ApiResponse, PageResponse } from '../types';

/** 后端特别奖励记录 */
export interface SpecialItemRecord {
  id: string;
  name: string;
  description?: string | null;
  cardsCost: number;
  icon?: string;
  color?: string;
  imageUrl?: string | null;
  status?: string;
  stock?: number;
  version?: number;
  belongBindingId?: string;
  publishUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpecialItemPublishPayload {
  name: string;
  description?: string;
  cardsCost: number;
  icon?: string;
  color?: string;
  imageUrl?: string | null;
  stock?: number;
}

export interface SpecialItemsPageQuery {
  page?: number;
  size?: number;
  /** 不传则全部 */
  status?: string;
  /** 区分自己和对方，默认自己 */
  type?: 'self' | 'target';
}

const specialItemsService = {
  async page(query: SpecialItemsPageQuery): Promise<ApiResponse<PageResponse<SpecialItemRecord>>> {
    return await request.get('/special-items/page', { params: query });
  },

  async publish(payload: SpecialItemPublishPayload): Promise<ApiResponse<SpecialItemRecord>> {
    return await request.post('/special-items/publish', payload);
  },

  async update(id: string, payload: SpecialItemPublishPayload): Promise<ApiResponse<SpecialItemRecord>> {
    return await request.put(`/special-items/${id}`, payload);
  },

  async remove(id: string): Promise<ApiResponse<string>> {
    return await request.delete(`/special-items/${id}`);
  },

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<SpecialItemRecord>> {
    return await request.post(`/special-items/${id}/status`, { status });
  },

  /** 兑换对方发布的特别奖励（扣万能卡），落库 user_items */
  async redeem(id: string): Promise<
    ApiResponse<{
      userItemId: string;
      verifyCode: string;
      specialItemId: string;
      /** 兼容旧接口 */
      userSpecialItemId?: string;
    }>
  > {
    return await request.post(`/special-items/${id}/redeem`);
  },
};

export default specialItemsService;
