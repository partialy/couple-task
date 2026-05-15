import type { MomentComment, MomentListItem } from '@/api/service/moments';

export type { MomentComment, MomentListItem };

/** 时间轴展示用：评论在弹层内单独加载 */
export type MomentTimelineEntry = MomentListItem;
