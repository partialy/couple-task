import request from "./request";
import { QueryParams } from "@/types";

const q = (params?: QueryParams) => ({ params: { page: 1, pageSize: 20, ...params } });

export const adminApi = {
  login: (payload: { username: string; password: string }) => request.post("/auth/login", payload),
  me: () => request.get("/auth/me"),

  users: (params?: QueryParams) => request.get("/users", q(params)),
  updateUserStatus: (id: string, payload: { status: string; reason?: string }) =>
    request.post(`/users/${id}/status`, payload),

  tasks: (params?: QueryParams) => request.get("/tasks", q(params)),
  updateTaskStatus: (id: string, payload: { status: string; reason?: string }) =>
    request.post(`/tasks/${id}/status`, payload),

  shopItems: (params?: QueryParams) => request.get("/shop-items", q(params)),
  rewardCodes: (params?: QueryParams) => request.get("/reward-codes", q(params)),
  feedbacks: (params?: QueryParams) => request.get("/feedbacks", q(params)),

  pointTransactions: (params?: QueryParams) => request.get("/transactions/points", q(params)),
  cardTransactions: (params?: QueryParams) => request.get("/transactions/cards", q(params)),
  itemTransactions: (params?: QueryParams) => request.get("/transactions/items", q(params)),

  moments: (params?: QueryParams) => request.get("/moments", q(params)),
  diaries: (params?: QueryParams) => request.get("/diaries", q(params)),
  systemConfigs: (params?: QueryParams) => request.get("/system-configs", q(params)),
  checkinPlans: (params?: QueryParams) => request.get("/checkin-plans", q(params)),

  dashboardOverview: () => request.get("/dashboard/overview"),
  dashboardTrends: () => request.get("/dashboard/trends"),
  dashboardDistributions: () => request.get("/dashboard/distributions"),
  dashboardRankings: () => request.get("/dashboard/rankings"),
  dashboardAlerts: () => request.get("/dashboard/alerts"),
  dashboardTodos: () => request.get("/dashboard/todos"),
};
