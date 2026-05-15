import request from '../request';
import { ApiResponse, PageResponse } from '../types';

export interface UserItemRecord {
  id: string;
  itemId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: string;
  status: 'usable' | 'used';
  code: string;
  acquiredAt: string;
  usedAt?: string;
  /** 0 否 1 是（特别奖励兑换） */
  isSpecial?: number;
}

export interface UserItemsPageQuery {
  page?: number;
  size?: number;
  status?: 'usable' | 'used';
  keyword?: string;
  /** 不传则全部；1 仅特别奖励兑换道具 */
  isSpecial?: 0 | 1;
}

const userItemsService = {
  async page(query: UserItemsPageQuery): Promise<ApiResponse<PageResponse<UserItemRecord>>> {
    return await request.get('/user-items/page', { params: query });
  },

  /** 核销前获取道具信息 */
  async info(code: string): Promise<ApiResponse<UserItemRecord>> {
    return await request.get('/user-items/info', { params: { code } });
  },

  /** 绑定对象核销对方背包道具（核销码 trim + 大写） */
  async verifyByCode(code: string): Promise<ApiResponse<string>> {
    const normalized = code.trim().toUpperCase();
    return await request.post('/user-items/verify', { code: normalized });
  },
};

export default userItemsService;
