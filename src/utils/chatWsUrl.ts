/**
 * 与后端 spring.mvc.servlet.path=/api 一致，WebSocket 路径为 /api/ws/chat
 */
export function getChatWebSocketUrl(): string {
  const base = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } })
    .env?.VITE_API_URL;
  const origin = base?.startsWith("http")
    ? base
    : `${window.location.protocol}//${window.location.host}`;
  const u = new URL(origin);
  const wsProto = u.protocol === "https:" ? "wss:" : "ws:";
  const token = localStorage.getItem("token") || "";
  const tokenParam = encodeURIComponent(
    token.startsWith("Bearer ") ? token : `Bearer ${token}`
  );
  return `${wsProto}//${u.host}/api/ws/chat?token=${tokenParam}`;
}
