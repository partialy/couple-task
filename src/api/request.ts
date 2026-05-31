import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import eventBus from '../utils/eventBus';

const request = axios.create({
    // @ts-ignore
    baseURL: '/api',
    timeout: 15000,
});

const REQUEST_CACHE_TTL_MS = 2000;

type CacheEntry = {
    at: number;
    data: unknown;
};

const requestCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

function stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(',')}]`;
    }
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

function buildRequestCacheKey(config: AxiosRequestConfig): string {
    const method = (config.method || 'get').toLowerCase();
    const url = `${config.baseURL || ''}${config.url || ''}`;
    const params = stableStringify(config.params ?? null);
    return `${method}|${url}|${params}`;
}

function makeCachedResponse(
    config: InternalAxiosRequestConfig,
    data: unknown,
): AxiosResponse {
    return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: { fromCache: true },
    };
}

/** 并行请求同时 401 时只触发一次未授权提示，避免刷屏 */
let lastUnauthorizedEmitAt = 0;
const UNAUTHORIZED_EMIT_GAP_MS = 2500;

request.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const method = (config.method || 'get').toLowerCase();
    if (method !== 'get') {
        return config;
    }

    const cacheKey = buildRequestCacheKey(config);
    (config as InternalAxiosRequestConfig & { __cacheKey?: string }).__cacheKey = cacheKey;

    const now = Date.now();
    const cached = requestCache.get(cacheKey);
    if (cached && now - cached.at < REQUEST_CACHE_TTL_MS) {
        config.adapter = async (cfg) => makeCachedResponse(cfg, cached.data);
        return config;
    }

    const pending = pendingRequests.get(cacheKey);
    if (pending) {
        config.adapter = async (cfg) => makeCachedResponse(cfg, await pending);
        return config;
    }

    const baseAdapter = config.adapter || request.defaults.adapter || axios.defaults.adapter;
    if (typeof baseAdapter === 'function') {
        config.adapter = async (cfg) => {
            const responsePromise = Promise.resolve(baseAdapter(cfg));
            const dataPromise = responsePromise
                .then((res) => res.data)
                .finally(() => pendingRequests.delete(cacheKey));
            pendingRequests.set(cacheKey, dataPromise);
            return responsePromise;
        };
    }
    return config;
}, error => {
    eventBus.emit("REQUEST_ERROR", error);
})

request.interceptors.response.use(response => {
    const method = (response.config.method || 'get').toLowerCase();
    if (method === 'get') {
        const cfg = response.config as InternalAxiosRequestConfig & { __cacheKey?: string };
        const cacheKey = cfg.__cacheKey || buildRequestCacheKey(response.config);
        requestCache.set(cacheKey, { at: Date.now(), data: response.data });
    }
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
        console.error("请求错误：", error.response?.data);
    }
    return error.response?.data;
})

export default request;