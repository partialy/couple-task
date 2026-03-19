import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Categories, TaskLevels, Tags, Tasks, Result } from '@/api/sql_models';
import taskService, { TaskCreateDTO } from '@/api/service/task';
import { UiTask } from '@/types/task';
import { mapTaskVOToUiTask } from '@/mappers/task';

interface TaskState {
  tasks: UiTask[];
  categories: Categories[];
  taskLevels: TaskLevels[];
  allTags: Tags[];
  loading: boolean;
  configFetched: boolean;

  // Actions
  addTask: (task: UiTask) => void;
  createTask: (taskData: TaskCreateDTO) => Promise<Result<string>>;
  fetchTasks: () => Promise<void>;
  acceptTask: (taskId: string) => Promise<Result<string>>;
  abandonTask: (taskId: string) => Promise<Result<string>>;
  completeTask: (taskId: string) => Promise<Result<string>>;
  updateTaskStatus: (taskId: string | number, status: string) => void;
  deleteTask: (taskId: string | number) => void;
  toggleBookmark: (taskId: string | number) => void;
  getTaskById: (id: string | number) => any | undefined;
  setTasks: (tasks: UiTask[]) => void;
  fetchPublishConfig: (bindId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [] as UiTask[],
      categories: [
        { id: 'default-1', name: '旅行' },
        { id: 'default-2', name: '美食' },
        { id: 'default-3', name: '日常' },
        { id: 'default-4', name: '心愿单' },
        { id: 'default-5', name: '纪念日' }
      ] as Categories[],
      taskLevels: [
        { id: 'default-1', name: '小事', maxRewards: 1 },
        { id: 'default-2', name: '简单', maxRewards: 1 },
        { id: 'default-3', name: '中等', maxRewards: 2 },
        { id: 'default-4', name: '高级', maxRewards: 3 },
        { id: 'default-5', name: '困难', maxRewards: 3 },
        { id: 'default-6', name: '极难', maxRewards: 4 }
      ] as TaskLevels[],
      allTags: [] as Tags[],
      loading: false,
      configFetched: false,

      addTask: (task) => {
        set(state => ({ tasks: [task, ...state.tasks] }));
      },

      createTask: async (taskData) => {
        set({ loading: true });
        try {
          const result = await taskService.create(taskData);
          if (result.success) {
            get().fetchTasks();
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      fetchTasks: async () => {
        set({ loading: true });
        try {
          const result = await taskService.list();
          if (result.success && result.data) {
            // Map TaskVO to local task structure
            const mappedTasks = result.data.map(mapTaskVOToUiTask);
            set({ tasks: mappedTasks });
          }
        } finally {
          set({ loading: false });
        }
      },

      acceptTask: async (taskId: string) => {
        set({ loading: true });
        try {
          const result = await taskService.accept(taskId);
          if (result.success) {
            set(state => ({
              tasks: state.tasks.map(t =>
                t.id === taskId ? { ...t, status: 'in-progress' } : t
              )
            }));
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      abandonTask: async (taskId: string) => {
        set({ loading: true });
        try {
          const result = await taskService.abandon(taskId);
          if (result.success) {
            set(state => ({
              tasks: state.tasks.map(t =>
                t.id === taskId ? { ...t, status: 'pending' } : t
              )
            }));
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      completeTask: async (taskId: string) => {
        set({ loading: true });
        try {
          const result = await taskService.complete(taskId);
          if (result.success) {
            set(state => ({
              tasks: state.tasks.map(t =>
                t.id === taskId ? { ...t, status: 'completed' } : t
              )
            }));
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
        const state = get();
        // 如果已经请求过配置了，就不再请求
        if (state.configFetched) {
          return;
        }

        const { userService } = await import('@/api/service/user');
        try {
          const res = await userService.publishConfig(bindId);
          if (res.success) {
            set({
              categories: res.data.categories,
              taskLevels: res.data.taskLevels,
              allTags: res.data.tags,
              configFetched: true
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
