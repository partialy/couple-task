import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Categories, TaskLevels, Tags, Tasks, Result } from '@/api/sql_models';
import { initialTasks } from '@/data/tasks';
import taskService, { TaskCreateDTO } from '@/api/service/task';

interface TaskState {
  tasks: any[]; // Using any[] to match initialTasks structure for now
  categories: Categories[];
  taskLevels: TaskLevels[];
  allTags: Tags[];
  loading: boolean;

  // Actions
  addTask: (task: any) => void;
  createTask: (taskData: TaskCreateDTO) => Promise<Result<string>>;
  updateTaskStatus: (taskId: string | number, status: string) => void;
  deleteTask: (taskId: string | number) => void;
  toggleBookmark: (taskId: string | number) => void;
  getTaskById: (id: string | number) => any | undefined;
  setTasks: (tasks: any[]) => void;
  fetchPublishConfig: (bindId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      categories: [] as Categories[],
      taskLevels: [] as TaskLevels[],
      allTags: [] as Tags[],
      loading: false,

      addTask: (task) => {
        set(state => ({ tasks: [task, ...state.tasks] }));
      },

      createTask: async (taskData) => {
        set({ loading: true });
        try {
          const result = await taskService.create(taskData);
          if (result.success) {
            // 这里可以根据需要决定是否立即更新本地列表，或者等下次刷新
            // 为了体验好，我们可以手动构造一个本地任务对象加入列表
            const newTask = {
              id: result.data,
              title: taskData.title,
              desc: taskData.description,
              img: taskData.coverImage || 'https://picsum.photos/seed/new/400/600',
              tags: [taskData.category, ...taskData.tags],
              rewards: taskData.rewards,
              status: 'pending',
              author: '兔兔', // 实际应从 userStore 获取
              isPrivate: taskData.isPrivate,
              isPrivileged: taskData.isPrivileged,
              taskType: taskData.taskType,
              deadline: taskData.deadline
            };
            set(state => ({ tasks: [newTask, ...state.tasks] }));
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      updateTaskStatus: (taskId, status) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? { ...t, status: status } : t
          )
        }));
      },

      deleteTask: (taskId) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== taskId)
        }));
      },

      toggleBookmark: (taskId) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? { ...t, isBookmarked: !t.isBookmarked } : t
          )
        }));
      },

      getTaskById: (id) => {
        return get().tasks.find(t => t.id === id);
      },

      setTasks: (tasks) => {
        set({ tasks });
      },

      fetchPublishConfig: async (bindId) => {
        const { userService } = await import('@/api/service/user');
        try {
          const res = await userService.publishConfig(bindId);
          if (res.success) {
            set({
              categories: res.data.categories,
              taskLevels: res.data.taskLevels,
              allTags: res.data.tags
            });
          }
        } catch (error) {
          console.error('Failed to fetch publish config', error);
        }
      }
    }),
    {
      name: 'yutask-task-storage-v4',
    }
  )
);
