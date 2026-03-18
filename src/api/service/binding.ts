import request from "../request";
import { ApiResponse } from "../types";
import { BindingRelations, Users } from "../sql_models";

export interface InviteDTO {
    invite: BindingRelations;
    otherUser: Users;
}

export const bindingService = {
    /**
     * 获取我的邀请码
     */
    getMyCode: async () : Promise<ApiResponse<string>> => {
        return await request.get('/binding/my-code');
    },

    /**
     * 发送邀请
     */
    invite: async (inviteCode: string) : Promise<ApiResponse<null>> => {
        return await request.post('/binding/invite', { inviteCode });
    },

    /**
     * 获取收到的邀请
     */
    getReceivedInvites: async () : Promise<ApiResponse<InviteDTO[]>> => {
        return await request.get('/binding/received');
    },

    /**
     * 获取发送的邀请
     */
    getSentInvites: async () : Promise<ApiResponse<InviteDTO[]>> => {
        return await request.get('/binding/sent');
    },

    /**
     * 接受邀请
     */
    accept: async (inviteId: string) : Promise<ApiResponse<null>> => {
        return await request.post('/binding/accept', { inviteId });
    },

    /**
     * 拒绝邀请
     */
    reject: async (inviteId: string) : Promise<ApiResponse<null>> => {
        return await request.post('/binding/reject', { inviteId });
    },
}
