import request from '../request';
import { ApiResponse } from '../types';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  itemType: string;
  pointsCost: number;
  icon: string;
  color: string;
  status: string;
  stock: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  belongBindingId: string;
  belongUserId: string;
  publishUserId: string;
  sortOrder: number;
}

const shopItemsService = {
  /**
   * 获取商城商品列表
   */
  async getShopItems(): Promise<ApiResponse<ShopItem[]>> {
    return await request.get('/shop-items');
  }
};

export default shopItemsService;
