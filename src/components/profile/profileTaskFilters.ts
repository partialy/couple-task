import type { UiTask } from '@/types/task';

/** 我发布的任务：作者为当前用户 */
export function filterMyPublishedTasks(tasks: UiTask[], uid: string | undefined): UiTask[] {
  if (!uid) return [];
  return tasks.filter((t) => t.authorId === uid);
}

/**
 * 我接受的任务：接收人为当前用户，且进行中或已完成
 *（pending 等未接取状态不展示在此列表）
 */
export function filterMyReceivedTasks(tasks: UiTask[], uid: string | undefined): UiTask[] {
  if (!uid) return [];
  return tasks.filter(
    (t) =>
      t.receiverId === uid &&
      (t.status === 'in-progress' || t.status === 'completed'),
  );
}
