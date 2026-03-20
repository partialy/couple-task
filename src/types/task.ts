import { TaskRewards } from "@/api/sql_models";

export interface UiTask {
  id: string;
  title: string;
  desc: string;
  img: string;
  tags: string[];
  category: string;
  level: string;
  rewards: TaskRewards[];
  status: string;
  authorId: string;
  author: string;
  authorAvatar: string;
  authorName: string;
  gender:string;
  isPrivate: boolean;
  isPrivileged: boolean;
  taskType?: string;
  repeatConfig?: unknown;
  deadline?: string;
  receiverId?: string;
  location?: string;
  isBookmarked: boolean;
  otherImages: string[];
  createdAt?: string;
}

export interface UiTaskDetail extends UiTask {
  authorAvatar: string | null;
  commentCount?: number;
}
