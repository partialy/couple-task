import request from '../request';
import { ApiResponse } from '../types';
import type { MemorialEventType } from '@/utils/pure/calculateMemorialDays';

export type { MemorialEventType };

/** 纪念日记录 */
export interface MemorialItem {
  id: string;
  bindId: string;
  userId: string;
  title: string;
  eventType?: MemorialEventType | string;
  iconKey?: string;
  customIconUrl?: string | null;
  colorThemeId?: string;
  customCategory?: string;
  personName?: string | null;
  /** 后端字段 isPinned */
  isPinned?: number;
  /** 兼容：1=倒数日 2=纪念日 */
  kind: number;
  anchorDate: string;
  repeatYearly: number;
  note?: string | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface MemorialPayload {
  title?: string;
  eventType?: MemorialEventType | string;
  iconKey?: string;
  customIconUrl?: string | null;
  colorThemeId?: string;
  customCategory?: string;
  personName?: string | null;
  pinned?: boolean;
  kind?: number;
  anchorDate?: string;
  repeatYearly?: boolean;
  note?: string;
  sortOrder?: number;
}

const memorialService = {
  async list(bindId: string): Promise<ApiResponse<MemorialItem[]>> {
    return await request.get('/memorial/list', { params: { bindId } });
  },

  async add(payload: MemorialPayload): Promise<ApiResponse<MemorialItem>> {
    return await request.post('/memorial/add', payload);
  },

  async update(id: string, payload: Partial<MemorialPayload>): Promise<ApiResponse<MemorialItem>> {
    return await request.post(`/memorial/update/${id}`, payload);
  },

  async remove(id: string): Promise<ApiResponse<unknown>> {
    return await request.post(`/memorial/delete/${id}`);
  },
};

export default memorialService;
