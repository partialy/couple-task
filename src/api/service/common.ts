import request from "../request";
import { ApiResponse } from "../types";

export interface QiniuTokenResponse {
    uploadToken: string;
    uploadUrl: string;
    domain: string;
    cdnDomain: string;
}

export const commonService = {
    /**
     * 获取七牛云上传Token
     */
    getQiniuToken: async (): Promise<ApiResponse<QiniuTokenResponse>> => {
        return request.get('/common/qiniu/token');
    }
};
