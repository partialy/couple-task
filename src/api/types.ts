import { BindingRelations, Users, Categories, Tags, TaskLevels, Tasks, TaskRewards, TaskImages } from "./sql_models";

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

export interface UserInitResponse {
    bindingRelations: BindingRelations;
    isBinding: boolean;
    user: Users;
    bindUser: Users;
}

export interface PublishConfigResponse {
    categories: Categories[];
    tags: Tags[];
    taskLevels: TaskLevels[];
}

export interface TaskVO extends Tasks {
    tags: string[];
    rewards: TaskRewards[];
    images: TaskImages[];
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

