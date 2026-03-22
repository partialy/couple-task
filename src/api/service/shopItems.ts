import request from '../request';
import { ApiResponse } from '../types';

/** 后端商城商品 */
export interface ShopItemRecord {
  id: string;
  name: string;
  description?: string | null;
  itemType: string;
  pointsCost: number;
  icon?: string | null;
  color?: string | null;
  status: string;
  stock: number;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  belongBindingId?: string | null;
  belongUserId?: string | null;
  publishUserId?: string | null;
  sortOrder?: number;
}

export interface ShopItemPublishPayload {
  name: string;
  description?: string;
  itemType?: string;
  pointsCost: number;
  icon?: string;
  /** 颜色 key：pink / purple 等 */
  color?: string;
  stock?: number;
  status?: string;
}

const shopItemsService = {
  async listForRedeem(): Promise<ApiResponse<ShopItemRecord[]>> {
    return await request.get('/shop-items/redeem');
  },

  async listForPublish(): Promise<ApiResponse<ShopItemRecord[]>> {
    return await request.get('/shop-items/my-published');
  },

  async publish(payload: ShopItemPublishPayload): Promise<ApiResponse<ShopItemRecord>> {
    return await request.post('/shop-items', payload);
  },

  async update(id: string, payload: ShopItemPublishPayload): Promise<ApiResponse<ShopItemRecord>> {
    return await request.put(`/shop-items/${id}`, payload);
  },

  async remove(id: string): Promise<ApiResponse<unknown>> {
    return await request.delete(`/shop-items/${id}`);
  },
};

export default shopItemsService;
