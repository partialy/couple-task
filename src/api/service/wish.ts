import request from '../request';
import { ApiResponse } from '../types';

/** 后端 wish_items 行 */
export interface WishItem {
  id: string;
  bindId: string;
  publisherUserId: string;
  pickableByUserId: string;
  content: string;
  colorKey: string;
  bottleSide: number;
  pickedTimes: number;
  status: string;
  lastPickedByUserId?: string | null;
  lastPickedAt?: string | null;
  fulfilledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  /** 仅在「我的心愿」记录列表中隐藏 */
  recordHiddenAt?: string | number | null;
}

export interface WishSummary {
  myPickChances: number;
  partnerPickChances: number;
}

export interface WishAddPayload {
  bindId: string;
  content: string;
  colorKey: string;
}

const wishService = {
  async summary(bindId: string): Promise<ApiResponse<WishSummary>> {
    return await request.get('/wish/summary', { params: { bindId } });
  },

  async listMine(bindId: string, includeHidden = false): Promise<ApiResponse<WishItem[]>> {
    return await request.get('/wish/listMine', {
      params: { bindId, includeHidden: includeHidden ? '1' : '0' },
    });
  },

  async listPartnerPending(bindId: string): Promise<ApiResponse<WishItem[]>> {
    return await request.get('/wish/listPartnerPending', { params: { bindId } });
  },

  async add(payload: WishAddPayload): Promise<ApiResponse<WishItem>> {
    return await request.post('/wish/add', payload);
  },

  async pick(bindId: string): Promise<ApiResponse<WishItem>> {
    return await request.post('/wish/pick', {}, { params: { bindId } });
  },

  async keep(id: string): Promise<ApiResponse<WishItem>> {
    return await request.post(`/wish/keep/${id}`);
  },

  async putBack(id: string): Promise<ApiResponse<WishItem>> {
    return await request.post(`/wish/putBack/${id}`);
  },

  async remove(id: string): Promise<ApiResponse<unknown>> {
    return await request.post(`/wish/delete/${id}`);
  },

  async hideRecord(id: string): Promise<ApiResponse<unknown>> {
    return await request.post(`/wish/hideRecord/${id}`);
  },

  async unhideRecord(id: string): Promise<ApiResponse<unknown>> {
    return await request.post(`/wish/unhideRecord/${id}`);
  },
};

export default wishService;
