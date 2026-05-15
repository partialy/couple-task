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
  voidRewardCode: (id: string) => request.post(`/reward-codes/${id}/void`),
  restoreRewardCode: (id: string) => request.post(`/reward-codes/${id}/restore`),
  feedbacks: (params?: QueryParams) => request.get("/feedbacks", q(params)),
  processFeedback: (id: string, payload: { status: string; reply?: string }) =>
    request.post(`/feedbacks/${id}/process`, payload),

  pointTransactions: (params?: QueryParams) => request.get("/transactions/points", q(params)),
  cardTransactions: (params?: QueryParams) => request.get("/transactions/cards", q(params)),
  itemTransactions: (params?: QueryParams) => request.get("/transactions/items", q(params)),

  moments: (params?: QueryParams) => request.get("/moments", q(params)),
  deleteMoment: (id: string) => request.post(`/moments/${id}/delete`),
  diaries: (params?: QueryParams) => request.get("/diaries", q(params)),
  deleteDiary: (id: string) => request.post(`/diaries/${id}/delete`),
  systemConfigs: (params?: QueryParams) => request.get("/system-configs", q(params)),
  enableSystemConfig: (id: string | number) => request.post(`/system-configs/${id}/enable`),
  disableSystemConfig: (id: string | number) => request.post(`/system-configs/${id}/disable`),
  checkinPlans: (params?: QueryParams) => request.get("/checkin-plans", q(params)),
  updateCheckinPlanStatus: (id: string, payload: { status: string; reason?: string }) =>
    request.post(`/checkin-plans/${id}/status`, payload),

  dashboardOverview: () => request.get("/dashboard/overview"),
  dashboardTrends: () => request.get("/dashboard/trends"),
  dashboardDistributions: () => request.get("/dashboard/distributions"),
  dashboardRankings: () => request.get("/dashboard/rankings"),
  dashboardAlerts: () => request.get("/dashboard/alerts"),
  dashboardTodos: () => request.get("/dashboard/todos"),
};
