import request from "../request";
import { ApiResponse, UserInitResponse, PublishConfigResponse, PartnerOverviewResponse } from "../types";
import { Users } from "../sql_models";

export interface UserUpdateParams {
    nickname?: string;
    title?: string;
    avatar?: string;
    gender?: string;
    phone?: string;
    email?: string;
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

    /** 绑定对象资料与任务/道具/资产汇总 */
    partnerOverview: async (): Promise<ApiResponse<PartnerOverviewResponse>> => {
        return await request.get('/user/partnerOverview');
    },
}
