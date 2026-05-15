import axios from "axios";

const request = axios.create({
  baseURL: "/api/admin/v1",
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body?.code === 0) {
      return body.data;
    }
    if (body?.code === 40100) {
      localStorage.removeItem("admin-token");
      window.location.href = "/login";
    }
    return Promise.reject(new Error(body?.message || "请求失败"));
  },
  (error) => Promise.reject(error)
);

export default request;
