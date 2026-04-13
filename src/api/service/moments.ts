import request from '../request';
import type { ApiResponse } from '../types';

export interface MomentListItem {
  id: string;
  authorUserId: string;
  userName: string;
  avatar: string;
  createdAt: number;
  content: string;
  images: string[];
  likes: number;
  likedByMe: boolean;
  commentCount: number;
}

export interface MomentComment {
  id: string;
  authorUserId: string;
  userName: string;
  avatar: string;
  createdAt: number;
  content: string;
}

export interface MomentLikeResult {
  likes: number;
  likedByMe: boolean;
}

const momentsService = {
  async list(bindId: string): Promise<ApiResponse<MomentListItem[]>> {
    return await request.get('/moments/list', { params: { bindId } });
  },

  async add(payload: { bindId: string; content: string; imageUrls?: string[] }): Promise<ApiResponse<MomentListItem>> {
    return await request.post('/moments/add', payload);
  },

  async toggleLike(bindId: string, momentId: string): Promise<ApiResponse<MomentLikeResult>> {
    return await request.post(`/moments/like/${momentId}`, {}, { params: { bindId } });
  },

  async addComment(payload: { bindId: string; momentId: string; content: string }): Promise<ApiResponse<MomentComment>> {
    return await request.post('/moments/comment/add', payload);
  },

  async listComments(bindId: string, momentId: string): Promise<ApiResponse<MomentComment[]>> {
    return await request.get('/moments/comments', { params: { bindId, momentId } });
  },
};

export default momentsService;
