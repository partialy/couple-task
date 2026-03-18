import request from "../request";
import { ApiResponse, UserLoginResponse } from "../types";
import { Users } from "../sql_models";

export const authService = {
    /**
     * 登录
     * @param input 用户名、邮箱、手机号
     * @param password 密码
     * @param code 验证码 (可选)
     * @returns 登录响应
     */
    login: async (input: string, password: string, code?: string) : Promise<ApiResponse<UserLoginResponse>> => {
        const url = code ? `/auth/login?code=${encodeURIComponent(code)}` : '/auth/login';
        return await request.post(url, {
            username: input,
            email: input,
            password: password,
            phone: input,
        });
    },

    /**
     * 登出
     * @returns 登出响应
     */
    logout: async () : Promise<ApiResponse<null>> => {
        return request.post('/auth/logout');
    },

    /**
     * 注册
     * @param params 用户信息
     * @param code 验证码
     * @returns 注册响应
     */
    register: async (params: Users, code: string) : Promise<ApiResponse<UserLoginResponse>> => {
        return request.post(`/auth/register?code=${encodeURIComponent(code)}`, params);
    },

    /**
     * 发送验证码
     * @param target 手机号或邮箱
     * @returns 发送结果
     */
    sendCode: async (target: string) : Promise<ApiResponse<string>> => {
        return request.post(`/auth/sendCode?target=${encodeURIComponent(target)}`);
    },
}
