/** 动态时间展示：刚刚 / n 分钟前 / 昨天 HH:mm / 日期 */
export function formatMomentTime(createdAt: number): string {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return '刚刚';
  if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)} 分钟前`;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yStart = todayStart - 86400_000;
  if (d.getTime() >= todayStart) {
    return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (d.getTime() >= yStart) {
    return `昨天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}
