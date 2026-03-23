import { commonService } from "@/api/service/common";
import axios from "axios";

/**
 * 上传文件到七牛云
 * @param file 文件对象
 * @param prefix 文件名前缀
 * @returns 上传后的完整URL
 */
export interface UploadToQiniuOptions {
  /** 默认 15s；大文件请传更大值或 0 表示不限制（由 axios 行为决定） */
  timeout?: number;
}

export const uploadToQiniu = async (
  file: File,
  prefix: string = 'yutask',
  options?: UploadToQiniuOptions,
): Promise<string> => {
    try {
        // 1. 获取上传Token
        const res = await commonService.getQiniuToken();
        if (!res.success) {
            throw new Error(res.msg || '获取上传Token失败');
        }

        const { uploadToken, uploadUrl, domain, cdnDomain } = res.data;

        // 2. 准备上传数据
        const formData = new FormData();
        formData.append('token', uploadToken);
        formData.append('file', file);
        
        // 生成唯一文件名
        const ext = file.name.split('.').pop();
        const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
        formData.append('key', fileName);

        // 3. 执行上传
        const timeout =
            options?.timeout !== undefined
                ? options.timeout
                : file.size > 10 * 1024 * 1024
                  ? 60 * 60 * 1000
                  : 15000;

        const uploadRes = await axios.post(uploadUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout,
        });

        if (uploadRes.status !== 200) {
            throw new Error('上传到七牛云失败');
        }

        // 4. 返回完整URL (优先使用CDN域名)
        const baseUrl = cdnDomain || domain;
        // 确保域名以 http:// 或 https:// 开头，且不以 / 结尾
        let formattedDomain = baseUrl.startsWith('//') ? `https:${baseUrl}` : baseUrl;
        if (!formattedDomain.startsWith('http')) {
            formattedDomain = `https://${formattedDomain}`;
        }
        if (formattedDomain.endsWith('/')) {
            formattedDomain = formattedDomain.slice(0, -1);
        }

        return `${formattedDomain}/${fileName}`;
    } catch (error) {
        console.error('Qiniu upload error:', error);
        throw error;
    }
};

/**
 * 创建本地预览URL
 */
export const createLocalPreview = (file: File): string => {
    return URL.createObjectURL(file);
};

/**
 * 释放本地预览URL
 */
export const revokeLocalPreview = (url: string): void => {
    if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};
