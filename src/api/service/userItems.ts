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
}

export interface UserItemsPageQuery {
  page?: number;
  size?: number;
  status?: 'usable' | 'used';
  keyword?: string;
}

const userItemsService = {
  async page(query: UserItemsPageQuery): Promise<ApiResponse<PageResponse<UserItemRecord>>> {
    return await request.get('/user-items/page', { params: query });
  },
};

export default userItemsService;
