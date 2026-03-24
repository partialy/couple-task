import request from "@/api/request";

/**
 * 聊天 WebSocket 地址（后端 spring.mvc.servlet.path=/api，端点为 /api/ws/chat）
 *
 * - 开发（import.meta.env.DEV）：使用当前页面 origin + /api/ws/chat，由 Vite 代理到后端（需 vite proxy ws: true）
 * - 生产：使用 VITE_API_URL 的 host（直连后端）；未配置则回退为当前页面 host
 */
export function getChatWebSocketUrl(): string {
  const token = localStorage.getItem("token") || "";
  const tokenParam = encodeURIComponent(
    token.startsWith("Bearer ") ? token : `Bearer ${token}`
  );
  const path = "/api/ws/chat";
  const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProto}//${window.location.host}${path}?token=${tokenParam}`;
}
