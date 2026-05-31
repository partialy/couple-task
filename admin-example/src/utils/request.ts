export const API_BASE_URL = "/api/admin/v1";

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(err => {
    console.error("Failed to parse JSON response:", err);
    throw new Error("服务器响应格式错误");
  });

  if (data.code === 40100) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error(data.message);
  }

  if (data.code !== 0) {
    throw new Error(data.message || "请求失败");
  }

  return data.data;
}
