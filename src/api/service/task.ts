import axios from 'axios';
import { Result } from '../sql_models';

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
  async create(taskData: TaskCreateDTO): Promise<Result<string>> {
    const token = localStorage.getItem('token');
    const response = await axios.post('/task/create', taskData, {
      headers: {
        'Authorization': token
      }
    });
    return response.data;
  }
};

export default taskService;
