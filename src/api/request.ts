import axios, { AxiosError } from 'axios';
import eventBus from '../utils/eventBus';

const request = axios.create({
    // @ts-ignore
    baseURL: import.meta.env.VITE_API_URL + '/api',
    timeout: 15000,
});

/** 并行请求同时 401 时只触发一次未授权提示，避免刷屏 */
let lastUnauthorizedEmitAt = 0;
const UNAUTHORIZED_EMIT_GAP_MS = 2500;

request.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    eventBus.emit("REQUEST_ERROR", error);
})

request.interceptors.response.use(response => {
    return response.data;
}, (error: AxiosError) => {
    const data = error.response?.data as { code?: number; msg?: string } | undefined;
    const http401 = error.response?.status === 401;
    const body401 = data?.code === 401;
    if (http401 || body401) {
        const now = Date.now();
        if (now - lastUnauthorizedEmitAt >= UNAUTHORIZED_EMIT_GAP_MS) {
            lastUnauthorizedEmitAt = now;
            const msg = '登录已失效，请重新登录';
            eventBus.emit("UNAUTHORIZED", msg);
        }
    } else {
        eventBus.emit("REQUEST_ERROR", error.response?.data);
    }
    console.error("请求错误：", error.response?.data);
    return error.response?.data;
})

export default request;