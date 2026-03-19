import request from '../request';
import { ApiResponse } from '../types';

export interface PointTransaction {
  id: number;
  userId: string;
  amount: number;
  transactionType: string;
  referenceId: string;
  description: string;
  createdAt: string;
}

const pointsService = {
  /**
   * 获取积分流水记录
   */
  async getHistory(): Promise<ApiResponse<PointTransaction[]>> {
    return await request.get('/points/history');
  },

  /**
   * 兑换积分（通过兑换码）
   * @param code 兑换码
   */
  async redeemCode(code: string): Promise<ApiResponse<string>> {
    return await request.post(`/points/redeem-code?code=${code}`);
  },

  /**
   * 兑换商品（使用积分）
   * @param itemId 商品ID
   */
  async redeemItem(itemId: string): Promise<ApiResponse<string>> {
    return await request.post(`/points/redeem-item/${itemId}`);
  }
};

export default pointsService;
