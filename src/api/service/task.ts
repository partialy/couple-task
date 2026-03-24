import request from '../request';
import { Result } from '../sql_models';
import { ApiResponse, TaskCommentCreateDTO, TaskCommentVO, TaskDetailVO, TaskVO } from '../types';

// 任务发布数据结构
export interface TaskCreateDTO {
  title: string;
  description: string;
  categoryId: string;
  levelId: string;
  deadline?: string;
  coverImage: string;
  otherImages: string[];
  tags: string[];
  rewards: {
    text: string;
    description?: string;
    color: string;
    icon: string;
    type: 'normal' | 'wild_card' | 'points';
    amount?: number;
  }[];
  isPrivate: boolean;
  isPrivileged: boolean;
  taskType: string;
  repeatConfig?: string;
  /** 创建时 true 表示保存草稿 */
  saveAsDraft?: boolean;
}

const taskService = {
  /**
   * 发布新任务
   * @param taskData 任务数据
   */
  async create(taskData: TaskCreateDTO): Promise<ApiResponse<string>> {
    return await request.post('/task/create', taskData);
  },

  /**
   * 更新任务（仅发布者）
   */
  async update(taskId: string, taskData: TaskCreateDTO): Promise<ApiResponse<string>> {
    return await request.put(`/task/${encodeURIComponent(taskId)}`, taskData);
  },

  /**
   * 获取任务列表
   */
  async list(): Promise<ApiResponse<TaskVO[]>> {
    return await request.get('/task/list');
  },

  /**
   * 获取任务详情
   * @param taskId 任务ID
   */
  async detail(taskId: string): Promise<ApiResponse<TaskDetailVO>> {
    return await request.get(`/task/detail/${taskId}`);
  },

  /**
   * 接取任务
   * @param taskId 任务ID
   */
  async accept(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/accept/${taskId}`);
  },

  /**
   * 放弃任务
   * @param taskId 任务ID
   */
  async abandon(taskId: string | number): Promise<ApiResponse<string>> {
    return await request.post(`/task/abandon/${taskId}`);
  },

  /**
   * 完成任务
   * @param taskId 任务ID
   */
  async complete(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/complete/${taskId}`);
  },

  /**
   * 申请完成任务（接收者）
   */
  async applyComplete(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/apply-complete/${taskId}`);
  },

  /**
   * 审核同意（发布者）
   */
  async approveAudit(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/audit/approve/${taskId}`);
  },

  /**
   * 审核拒绝（发布者）
   */
  async rejectAudit(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/audit/reject/${taskId}`);
  },

  /**
   * 获取任务评论列表
   * @param taskId 任务ID
   */
  async listComments(taskId: string): Promise<ApiResponse<TaskCommentVO[]>> {
    return await request.get('/task/comment/list', { params: { taskId } });
  },

  /**
   * 创建任务评论
   * @param payload 评论创建参数
   */
  async createComment(payload: TaskCommentCreateDTO): Promise<ApiResponse<TaskCommentVO>> {
    return await request.post('/task/comment/create', payload);
  },

  /**
   * 删除任务评论
   * @param commentId 评论ID
   */
  async deleteComment(commentId: string): Promise<ApiResponse<null>> {
    return await request.post(`/task/comment/delete/${commentId}`);
  },

  /** 收藏任务 */
  async favoriteTask(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/favorite/${taskId}`);
  },

  /** 取消收藏 */
  async unfavoriteTask(taskId: string): Promise<ApiResponse<string>> {
    return await request.delete(`/task/favorite/${taskId}`);
  },

  /** 下架（广场不可见） */
  async unpublish(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/${encodeURIComponent(taskId)}/unpublish`);
  },

  /** 上架 / 草稿首次发布 */
  async publishListing(taskId: string): Promise<ApiResponse<string>> {
    return await request.post(`/task/${encodeURIComponent(taskId)}/publish-listing`);
  },

  /** 删除任务（软删除，仅发布者、待接取） */
  async delete(taskId: string): Promise<ApiResponse<string>> {
    return await request.delete(`/task/${encodeURIComponent(taskId)}`);
  },
};

export default taskService;
