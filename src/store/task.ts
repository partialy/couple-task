import { create } from "zustand";
import { Categories, TaskLevels, Tasks, Result } from "@/api/sql_models";
import taskService, { TaskCreateDTO } from "@/api/service/task";
import { UiTask } from "@/types/task";
import { mapTaskVOToUiTask } from "@/mappers/task";
import { message } from "@/utils/pure/message";

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
  updateTask: (taskId: string, taskData: TaskCreateDTO) => Promise<Result<string>>;
  fetchTasks: () => Promise<void>;
  acceptTask: (taskId: string) => Promise<Result<string>>;
  abandonTask: (taskId: string) => Promise<Result<string>>;
  completeTask: (taskId: string) => Promise<Result<string>>;
  applyCompleteTask: (taskId: string) => Promise<Result<string>>;
  approveTaskAudit: (taskId: string) => Promise<Result<string>>;
  rejectTaskAudit: (taskId: string) => Promise<Result<string>>;
  updateTaskStatus: (taskId: string | number, status: string) => void;
  deleteTask: (taskId: string | number) => Promise<Result<string>>;
  toggleBookmark: (taskId: string | number) => Promise<void>;
  unpublishTask: (taskId: string) => Promise<Result<string>>;
  publishListingTask: (taskId: string) => Promise<Result<string>>;
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

      updateTask: async (taskId, taskData) => {
        set({ loading: true });
        try {
          const result = await taskService.update(taskId, taskData);
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

      applyCompleteTask: async (taskId: string) => {
        set({ loading: true });
        try {
          const result = await taskService.applyComplete(taskId);
          if (result.success) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId ? { ...t, status: "applying" } : t,
              ),
            }));
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      approveTaskAudit: async (taskId: string) => {
        set({ loading: true });
        try {
          const result = await taskService.approveAudit(taskId);
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

      rejectTaskAudit: async (taskId: string) => {
        set({ loading: true });
        try {
          const result = await taskService.rejectAudit(taskId);
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

      updateTaskStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: status } : t,
          ),
        }));
      },

      deleteTask: async (taskId) => {
        set({ loading: true });
        try {
          const id = String(taskId);
          const result = await taskService.delete(id);
          if (result.success) {
            await get().fetchTasks();
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      unpublishTask: async (taskId) => {
        set({ loading: true });
        try {
          const result = await taskService.unpublish(taskId);
          if (result.success) {
            await get().fetchTasks();
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      publishListingTask: async (taskId) => {
        set({ loading: true });
        try {
          const result = await taskService.publishListing(taskId);
          if (result.success) {
            await get().fetchTasks();
          }
          return result;
        } finally {
          set({ loading: false });
        }
      },

      toggleBookmark: async (taskId) => {
        const id = String(taskId);
        const current = get().tasks.find((t) => t.id === id);
        if (!current) return;
        const willFavorite = !current.isBookmarked;
        try {
          const result = willFavorite
            ? await taskService.favoriteTask(id)
            : await taskService.unfavoriteTask(id);
          if (result.success) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, isBookmarked: willFavorite } : t,
              ),
            }));
            message.success(willFavorite ? "已收藏" : "已取消收藏");
          } else {
            message.error(result.msg || "操作失败");
          }
        } catch {
          message.error("操作失败");
        }
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
