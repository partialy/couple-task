import type { UiTask } from '@/types/task';

function publishedListing(t: UiTask): boolean {
  return (t.listStatus ?? 'published') === 'published';
}

/** 我发布的任务：作者为当前用户且已上架（含进行中/已完成） */
export function filterMyPublishedTasks(tasks: UiTask[], uid: string | undefined): UiTask[] {
  if (!uid) return [];
  return tasks.filter((t) => t.authorId === uid && publishedListing(t));
}

/** 草稿箱：作者主动下架的任务 */
export function filterMyUnpublishedTasks(tasks: UiTask[], uid: string | undefined): UiTask[] {
  if (!uid) return [];
  return tasks.filter((t) => t.authorId === uid && t.listStatus === 'unpublished');
}

/** 我的草稿：未发布保存的草稿 */
export function filterMyDraftTasks(tasks: UiTask[], uid: string | undefined): UiTask[] {
  if (!uid) return [];
  return tasks.filter((t) => t.authorId === uid && t.listStatus === 'draft');
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
