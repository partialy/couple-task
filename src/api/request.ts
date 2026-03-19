import axios, { AxiosError } from 'axios';
import eventBus from '../utils/eventBus';
import { message } from '@/utils/pure/message';
const request = axios.create({
    baseURL: '/api',
    timeout: 15000,
})

request.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    console.log(token, config);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    eventBus.emit("REQUEST_ERROR", error);
})

request.interceptors.response.use(response => {
    if( response.data.code === 401 ) {
        eventBus.emit("UNAUTHORIZED", response.data.msg);
        message.error("未授权："+response.data.msg);
    }
    return response.data;
}, (error: AxiosError) => {
    eventBus.emit("REQUEST_ERROR", error.response.data);
    console.error("请求错误：", error.response.data);
    return error.response.data;
})

export default request;