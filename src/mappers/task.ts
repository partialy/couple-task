import { TaskVO, TaskDetailVO } from "@/api/types";
import { UiTask, UiTaskDetail } from "@/types/task";

/** 发布/编辑页预填（与 PublishTask initialData 一致，含编辑态 taskId） */
export interface PublishTaskInitialData {
  /** 存在则为编辑已有任务 */
  taskId?: string;
  title?: string;
  desc?: string;
  categoryId?: string;
  levelId?: string;
  tags?: string[];
  taskType?: string;
  repeatConfig?: string;
  rewards?: unknown[];
  img?: string;
  otherImages?: string[];
  deadline?: string;
  isPrivate?: boolean;
  isPrivileged?: boolean;
  rewardType?: "wild_card" | "points";
  wildcardAmount?: number;
  pointsAmount?: number;
}

function formatDeadlineForInput(deadline?: string | null): string {
  if (!deadline) return "";
  const d = deadline.includes("T") ? deadline.split("T")[0] : deadline.slice(0, 10);
  return d || "";
}

/**
 * 详情接口数据 → 发布页表单初始值（编辑）
 */
export function taskDetailVOToPublishInitial(detail: TaskDetailVO): PublishTaskInitialData {
  const imgs = (detail.images || []).map((i) => i.imageUrl).filter(Boolean);
  const cover = detail.coverImage || "";
  const otherImages = imgs.filter((u) => u !== cover);

  const rewardsList = detail.rewards || [];
  const normalRewardsPayload: Array<{
    text: string;
    color: string;
    icon: string;
    type: string;
    description: string;
    amount: number;
  }> = [];
  let rewardType: "wild_card" | "points" = "wild_card";
  let wildcardAmount = 1;
  let pointsAmount = 100;

  for (const r of rewardsList) {
    const t = String(r.type || "normal").toLowerCase();
    if (t === "wild_card" || t === "wildcard") {
      rewardType = "wild_card";
      wildcardAmount = Math.max(1, Math.min(10, r.amount ?? 1));
    } else if (t === "points") {
      rewardType = "points";
      pointsAmount = Math.max(1, Math.min(1000, r.amount ?? 100));
    } else {
      normalRewardsPayload.push({
        text: r.content ?? "",
        color: r.color || "pink",
        icon: r.icon || "Gift",
        type: "normal",
        description: (r as { description?: string }).description ?? "",
        amount: 1,
      });
    }
  }

  if (normalRewardsPayload.length === 0) {
    normalRewardsPayload.push({
      text: "",
      color: "pink",
      icon: "Gift",
      type: "normal",
      description: "",
      amount: 1,
    });
  }

  return {
    taskId: detail.id,
    title: detail.title || "",
    desc: detail.description || "",
    categoryId: detail.categoryId || "",
    levelId: detail.levelId || "",
    tags: detail.tags || [],
    taskType: detail.repeatType || "one-time",
    repeatConfig:
      typeof detail.repeatConfig === "string"
        ? detail.repeatConfig
        : detail.repeatConfig != null
          ? JSON.stringify(detail.repeatConfig)
          : undefined,
    rewards: normalRewardsPayload,
    img: cover || undefined,
    otherImages,
    deadline: formatDeadlineForInput(detail.deadline),
    isPrivate: detail.isPrivate === 1,
    isPrivileged: detail.isPrivileged === 1,
    rewardType,
    wildcardAmount,
    pointsAmount,
  };
}

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
