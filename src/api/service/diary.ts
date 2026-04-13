import request from '../request';
import { ApiResponse } from '../types';

export interface DiaryCommentItem {
  id: string;
  userId: string;
  userName: string;
  nickname?: string;
  avatar?: string;
  gender?: string;
  content: string;
  time: string;
}

export interface DiaryAuthorMeta {
  userId: string;
  userName: string;
  nickname?: string;
  avatar?: string;
  gender?: string;
  time?: string;
}

export interface DiaryItem {
  id: string;
  bindId: string;
  userId: string;
  entryDate: string;
  mood: string;
  content?: string | null;
  imageUrl?: string | null;
  likedByPartner: number;
  authorJson?: string | null;
  commentsJson?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface DiaryPayload {
  entryDate: string;
  mood: string;
  content?: string;
  imageUrl?: string;
}

export interface DiaryTodayCheckResponse {
  written: boolean;
}

const diaryService = {
  async list(bindId: string, entryDate?: string): Promise<ApiResponse<DiaryItem[]>> {
    return await request.get('/diary/list', { params: { bindId, entryDate } });
  },

  async checkToday(bindId: string): Promise<ApiResponse<DiaryTodayCheckResponse>> {
    return await request.get('/diary/checkToday', { params: { bindId } });
  },

  async add(payload: DiaryPayload): Promise<ApiResponse<DiaryItem>> {
    return await request.post('/diary/add', payload);
  },

  async update(id: string, payload: Partial<DiaryPayload>): Promise<ApiResponse<DiaryItem>> {
    return await request.post(`/diary/update/${id}`, payload);
  },

  async remove(id: string): Promise<ApiResponse<unknown>> {
    return await request.post(`/diary/delete/${id}`);
  },

  async toggleLike(id: string): Promise<ApiResponse<DiaryItem>> {
    return await request.post(`/diary/toggle-like/${id}`);
  },

  async addComment(id: string, content: string): Promise<ApiResponse<DiaryItem>> {
    return await request.post(`/diary/comment/${id}`, { content });
  },

  async deleteComment(id: string, commentId: string): Promise<ApiResponse<DiaryItem>> {
    return await request.post(`/diary/comment/delete/${id}/${commentId}`);
  },
};

export default diaryService;
