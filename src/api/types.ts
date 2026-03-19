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

