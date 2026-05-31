import request from '../request';
import type { ApiResponse } from '../types';

export interface SystemNotice {
  id: string;
  receiverUserId: string;
  senderUserId?: string | null;
  bindId?: string | null;
  noticeType: string;
  bizId?: string | null;
  title: string;
  content: string;
  payload?: string | null;
  isRead: number;
  readAt?: string | null;
  createdAt: string;
}

export interface SystemNoticePage {
  current: number;
  size: number;
  total: number;
  records: SystemNotice[];
}

const systemNoticeService = {
  async list(page = 1, size = 20): Promise<ApiResponse<SystemNoticePage>> {
    return await request.get('/system-notice/list', { params: { page, size } });
  },
  async unreadCount(): Promise<ApiResponse<{ count: number }>> {
    return await request.get('/system-notice/unread-count');
  },
  async read(id: string): Promise<ApiResponse<unknown>> {
    return await request.post(`/system-notice/read/${id}`);
  },
  async readAll(): Promise<ApiResponse<unknown>> {
    return await request.post('/system-notice/read-all');
  },
};

export default systemNoticeService;
