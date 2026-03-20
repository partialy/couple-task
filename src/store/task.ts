import { create } from "zustand";
import { Categories, TaskLevels, Tasks, Result } from "@/api/sql_models";
import taskService, { TaskCreateDTO } from "@/api/service/task";
import { UiTask } from "@/types/task";
import { mapTaskVOToUiTask } from "@/mappers/task";

const DEFAULT_TASK_TAGS = ["浪漫", "宅家", "音乐", "游乐园", "宠物"];

interface TaskState {
  tasks: UiTask[];
  categories: Categories[];
  taskLevels: TaskLevels[];
  allTags: string[];
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

export const useTaskStore = create<TaskState>()((set, get) => ({
      tasks: [] as UiTask[],
      categories: [] as Categories[],
      taskLevels: [] as TaskLevels[],
      allTags: DEFAULT_TASK_TAGS,
      loading: false,
      configFetched: false,

      addTask: (task) => {
        set((state) => ({ tasks: [task, ...state.tasks] }));
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
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId ? { ...t, status: "in-progress" } : t,
              ),
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
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId ? { ...t, status: "pending" } : t,
              ),
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
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId ? { ...t, status: "completed" } : t,
              ),
            }));
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: status } : t,
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },

      toggleBookmark: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, isBookmarked: !t.isBookmarked } : t,
          ),
        }));
      },

      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      setTasks: (tasks) => {
        set({ tasks });
      },

      fetchPublishConfig: async (bindId) => {
        const state = get();
        // 当前页面生命周期内避免重复请求
        if (state.configFetched) {
          return;
        }

        const { userService } = await import("@/api/service/user");
        try {
          const res = await userService.publishConfig(bindId);
          if (res.success) {
            set({
              categories: res.data.categories,
              taskLevels: res.data.taskLevels,
              allTags: DEFAULT_TASK_TAGS,
              configFetched: true,
            });
          }
        } catch (error) {
          console.error("Failed to fetch publish config", error);
        }
      },
    }));
