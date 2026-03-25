import request from '../request';
import { ApiResponse } from '../types';

/** 日程实体 */
export interface ScheduleItem {
  id: string;
  bindId: string;
  userId: string;
  type: string;
  description?: string | null;
  location?: string | null;
  images?: string | null;
  eventTime: string;
  eventRelationId?: string | null;
  popupRemind: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/** 新增/更新日程请求体 */
export interface SchedulePayload {
  type?: string;
  description?: string;
  location?: string;
  images?: string[];
  eventTime: string;
  eventRelationId?: string;
  popupRemind?: boolean;
}

const scheduleService = {
  /** 新增日程 */
  async add(payload: SchedulePayload): Promise<ApiResponse<ScheduleItem>> {
    return await request.post('/schedule/add', payload);
  },

  /** 更新日程 */
  async update(id: string, payload: Partial<SchedulePayload>): Promise<ApiResponse<ScheduleItem>> {
    return await request.post(`/schedule/update/${id}`, payload);
  },

  /** 删除日程（软删除） */
  async remove(id: string): Promise<ApiResponse<unknown>> {
    return await request.post(`/schedule/delete/${id}`);
  },

  /** 按日期范围查询日程列表 */
  async list(bindId: string, startDate: string, endDate: string): Promise<ApiResponse<ScheduleItem[]>> {
    return await request.get('/schedule/list', { params: { bindId, startDate, endDate } });
  },

  /** 查询某月有事件的日期列表 */
  async monthEvents(bindId: string, year: number, month: number): Promise<ApiResponse<string[]>> {
    return await request.get('/schedule/monthEvents', { params: { bindId, year, month } });
  },
};

export default scheduleService;
