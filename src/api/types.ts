import { BindingRelations, Users, Categories, TaskLevels, Tasks, TaskRewards, TaskImages } from "./sql_models";

export interface ApiResponse<T> {
    code: number;
    msg: string;
    data: T;
    errorMsg: string;
    success: boolean;
}

export interface PageResponse<T> {
    current: number;
    size: number;
    total: number;
    records: T[];
}

export interface UserLoginResponse {
    token: string;
    user: Users;
    bindingRelations: BindingRelations;
}

export interface TokenRefreshResponse {
    token: string;
}

export interface UserInitResponse {
    bindingRelations: BindingRelations;
    isBinding: boolean;
    user: Users;
    bindUser: Users | null;
}

/** GET /user/partnerOverview */
export interface PartnerOverviewResponse {
    profile: Users;
    points: number;
    cards: number;
    tasksPublished: number;
    tasksReceivedCompleted: number;
    tasksReceivedOngoing: number;
    tasksReceivedPending: number;
    usableItemCount: number;
    specialRewardsPublished: number;
}

export interface PublishConfigResponse {
    categories: Categories[];
    taskLevels: TaskLevels[];
}

export interface TaskVO extends Tasks {
    tags: string[];
    authorAvatar:string;
    authorName:string;
    gender:string;
    category: string;
    level: string;
    rewards: TaskRewards[];
    images: TaskImages[];
    /** 当前用户是否已收藏 */
    isBookmarked?: boolean;
}

export interface PublisherVO {
    id: string;
    nickname?: string;
    avatar?: string;
    level?: number;
    title?: string;
}

export interface TaskDetailVO extends TaskVO {
    publisher?: PublisherVO;
    commentCount?: number;
    repeatType?: string;
}

export interface TaskCommentVO {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    replyToId?: string;
    createdAt: string;
    userName?: string;
    userAvatar?: string;
}

export interface TaskCommentCreateDTO {
    taskId: string;
    content: string;
    replyToId?: string;
}

