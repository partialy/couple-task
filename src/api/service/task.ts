import request from '../request';
import { ApiResponse, TaskVO } from '../types';

// 任务发布数据结构
export interface TaskCreateDTO {
  title: string;
  description: string;
  category: string;
  level: string;
  deadline: string;
  coverImage: string;
  otherImages: string[];
  tags: string[];
  rewards: {
    text: string;
    color: string;
    icon: string;
    isWildcard?: boolean;
    amount?: number;
  }[];
  isPrivate: boolean;
  isPrivileged: boolean;
  taskType: string;
  repeatConfig?: string;
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
   * 获取任务列表
   */
  async list(): Promise<ApiResponse<TaskVO[]>> {
    return await request.get('/task/list');
  }
};

export default taskService;
