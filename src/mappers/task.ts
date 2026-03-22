import { TaskVO, TaskDetailVO } from "@/api/types";
import { UiTask, UiTaskDetail } from "@/types/task";

const DEFAULT_COVER = "https://picsum.photos/seed/new/400/600";

export function mapTaskVOToUiTask(task: TaskVO): UiTask {
  return {
    id: task.id,
    title: task.title || "",
    desc: task.description || "",
    img: task.coverImage || DEFAULT_COVER,
    tags: task.tags || [],
    category: task.category,
    level: task.level,
    rewards: task.rewards || [],
    status: task.status || "",
    authorId: task.authorId || "",
    authorAvatar: task.authorAvatar,
    authorName: task.authorName,
    gender: task.gender,
    author: task.authorName || task.authorId || "未知用户",
    receiverId: task.receiverId,
    location: task.location,
    isPrivate: task.isPrivate === 1,
    isPrivileged: task.isPrivileged === 1,
    taskType: task.repeatType,
    repeatConfig: task.repeatConfig,
    deadline: task.deadline,
    isBookmarked: !!task.isBookmarked,
    otherImages: (task.images || [])
      .map((item) => item.imageUrl)
      .filter(Boolean),
    createdAt: task.createdAt,
  };
}

export function mergeTaskDetailVOIntoUiTask(
  base: UiTask,
  detail: TaskDetailVO,
): UiTaskDetail {
  return {
    ...base,
    id: detail.id || base.id,
    title: detail.title || base.title,
    status: detail.status || base.status,
    authorId: detail.authorId || base.authorId,
    receiverId: detail.receiverId || base.receiverId,
    isPrivate: detail.isPrivate === 1 || base.isPrivate,
    isPrivileged: detail.isPrivileged === 1 || base.isPrivileged,
    desc: detail.description ?? base.desc,
    img: detail.coverImage || base.img,
    tags: detail.tags || base.tags,
    rewards: detail.rewards || base.rewards,
    otherImages:
      (detail.images || []).map((item) => item.imageUrl).filter(Boolean) ||
      base.otherImages,
    deadline: detail.deadline || base.deadline,
    taskType: detail.repeatType || base.taskType,
    repeatConfig: detail.repeatConfig || base.repeatConfig,
    author: detail.publisher?.nickname || base.author || detail.authorId || "",
    authorAvatar: detail.publisher?.avatar || null,
    createdAt: detail.createdAt || base.createdAt,
    commentCount: detail.commentCount,
    // 收藏态以列表/详情入口传入的 base（store 中的 task）为准；detail 为接口快照，
    // 收藏切换后不会自动刷新，若优先 detail 会导致心形图标不同步。
    isBookmarked: base.isBookmarked,
  };
}
