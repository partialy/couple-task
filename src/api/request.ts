import axios, { AxiosError } from 'axios';
import eventBus from '../utils/eventBus';
import message from '@/utils/message/message';
import { ApiResponse } from './types';
const request = axios.create({
    baseURL: '/api',
    timeout: 15000,
})

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
    if( error.response?.data && (error.response?.data as ApiResponse<any>).code == 401 ) {
        eventBus.emit("UNAUTHORIZED", (error.response?.data as ApiResponse<any>).msg);
    }
    console.error("请求错误：", error.response?.data);
    return error.response?.data;
})

export default request;