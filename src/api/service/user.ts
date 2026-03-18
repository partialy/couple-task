import request from "../request";
import { ApiResponse, UserInitResponse, PublishConfigResponse } from "../types";
import { Users } from "../sql_models";

export interface UserUpdateParams {
    nickname?: string;
    avatar?: string;
    gender?: string;
    birthday?: string;
    anniversary?: string;
    location?: string;
}

export const userService = {
    /**
     * 获取用户信息
     * @returns 用户信息
     */
    detail: async () : Promise<ApiResponse<UserInitResponse>> => {
        return await request.get('/user/detail');
    },

    /**
     * 更新用户信息
     */
    update: async (params: UserUpdateParams) : Promise<ApiResponse<Users>> => {
        return await request.post('/user/update', params);
    },

    /**
     * 获取发布配置
     */
    publishConfig: async (bindId: string) : Promise<ApiResponse<PublishConfigResponse>> => {
        return await request.get('/user/publishConfig', { params: { bindId } });
    },
}
